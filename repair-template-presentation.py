"""Repair compiled automation templates without changing source references or CRM data."""
from pathlib import Path
from lxml import html, etree
import re, json

ROOT = Path(__file__).resolve().parent
for path in sorted((ROOT / 'public/templates').glob('*/index.html')):
    key = path.parent.name
    tree = html.fromstring(path.read_text())
    body, head = tree.find('body'), tree.find('head')
    body.set('data-pp-template', key)
    body.set('data-pp-name', '{{NAME}}')
    def remove(el):
        if el.getparent() is not None:
            el.getparent().remove(el)
    # Retain the page styling; obsolete CMS/commerce scripts require configuration
    # that cannot belong to a personalized static concept.
    for el in tree.xpath('//script'):
        src = el.get('src', '')
        # Nailsy uses native details/video controls and the shared motion runtime.
        # Its original Webflow scroll handler overrides sticky-header offsets.
        keep = False
        keep |= key == '02-tastyc' and ('/jquery/jquery.min.js' in src or src.endswith('/swiper.min.js'))
        if not keep:
            remove(el)
    for el in tree.xpath('//link[@id="pp-presentation"]'):
        remove(el)
    for el in tree.xpath('//style'):
        if '.pp-bar{' in (el.text or '') or el.get('id') == 'pp-presentation':
            remove(el)
    for el in tree.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," pp-bar ") or contains(concat(" ",normalize-space(@class)," ")," pp-note ")]'):
        remove(el)
    for el in tree.xpath('//*[@id="__framer-badge-container" or @data-framer-name="Menu Header" or @data-framer-name="Footer"]'):
        remove(el)
    if key == '03-grand-restaurant':
        for el in tree.xpath('//*[@class]'):
            cls = el.get('class', '')
            if any(c in cls.split() for c in ['top_bar', 'mobile_menu_wrapper', 'header_style_wrapper']):
                remove(el)
        for el in tree.xpath('//*[@id="menu_wrapper" or @id="menu_expand_wrapper" or @id="mobile_menu_wrapper" or @id="elementor-header" or @id="elementor-sticky-header"]'):
            remove(el)
        headings = tree.xpath('//h2')
        if len(headings) >= 2 and headings[0].text_content().strip() == '{{NAME}}':
            headings[0].tag = 'h1'
            headings[0].set('class', 'pp-hero-title')
            headings[1].set('class', 'pp-hero-area')
        feature = 0
        for el in tree.xpath('//h2'):
            text = el.text_content().strip()
            if text == '{{MENU_LABEL}}':
                el.text = '{{FEATURE_' + str(feature % 6 + 1) + '}}'
                feature += 1
            elif text == 'Contact the team for details':
                el.text = 'Ask about your favourites'
            elif text.lower() in ['don’t need a silver fork to eat a good burger', 'have it your way']:
                el.text = 'Good food. Good company.'
        for text in tree.xpath('//text()[not(ancestor::style) and not(ancestor::script)]'):
            value = str(text).strip()
            if value in ['Life is like a burger the more you add to it, the better it becomes', 'Burger for the body is not enough there must be a burger for the soul', 'Roses are red, violets are blue. The burger costs less than dinner for two']:
                if text.is_tail:
                    text.getparent().tail = 'Explore the menu and contact our team.'
                else:
                    text.getparent().text = 'Explore the menu and contact our team.'
    if key == '01-nailsy':
        # Removed booking forms leave their styled containers behind.
        for el in tree.xpath('//section[contains(concat(" ",normalize-space(@class)," ")," section-appointment ")]'):
            remove(el)
        for el in tree.xpath('//section'):
            if not el.text_content().strip() and not el.xpath('.//img|.//video|.//iframe'):
                remove(el)
        # The copied lightbox has no video configuration. Use the actual local
        # video with native controls instead of a play link to business details.
        for el in tree.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," video-content ")]'):
            for link in el.xpath('.//a[contains(concat(" ",normalize-space(@class)," ")," w-lightbox ")]'):
                remove(link)
            el.set('class','pp-video-reference')
            for video in el.xpath('.//video'):
                video.set('controls','')
                video.set('preload','none')
                video.set('aria-label','Nail styling video — template design reference')
                poster=re.search(r'background-image:url\(([^)]+)\)',video.get('style',''))
                if poster: video.set('poster',poster[1])
                for attr in ['autoplay','loop','style','data-wf-ignore','data-object-fit']:
                    video.attrib.pop(attr,None)
                parent=video.getparent()
                parent.set('class','pp-reference-player')
                for attr in ['data-autoplay','data-loop','data-video-urls','data-poster-url']:
                    parent.attrib.pop(attr,None)
            if not el.xpath('./p[@class="pp-reference-caption"]'):
                el.append(html.fromstring('<p class="pp-reference-caption">Template video · design reference</p>'))
        for el in tree.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," home-1-banner-description ")]'):
            el.text = '{{DESCRIPTION}}'
        for el in tree.xpath('//p'):
            if el.text_content().strip() == '{{NAME}}':
                el.text = '{{DESCRIPTION}}'
        for text in tree.xpath('//text()[not(ancestor::style) and not(ancestor::script)]'):
            v = str(text).strip()
            replacement = {'New Color': 'Nail inspiration', 'Summer collection': 'Design reference', 'Imagine Yourself In Our Studio': 'A little inspiration for your next visit'}.get(v)
            if v.lower() == 'imagine yourself in our studio':
                replacement='Nail styling inspiration'
            if replacement:
                if text.is_tail: text.getparent().tail = replacement
                else: text.getparent().text = replacement
    if key == '02-tastyc':
        # A slide heading is one accessible headline, not three repeated H1s.
        for el in tree.xpath('//h1')[1:]:
            el.tag = 'h2'
        slides = tree.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," swiper-slide ")]')
        for index, slide in enumerate(slides[:3]):
            title = slide.xpath('.//h1|.//h2')
            if title and index:
                for child in list(title[0]): remove(child)
                title[0].text = 'Explore our menu' if index == 1 else 'Plan your next visit'
        for el in tree.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," tst-res-btn ")]'):
            el.attrib['class'] = ' '.join(c for c in el.get('class','').split() if c != 'tst-res-btn')
        for text in tree.xpath('//text()[not(ancestor::style) and not(ancestor::script)]'):
            v = str(text).strip()
            if v == 'Why people choose us?':
                text.getparent().text = 'Explore {{NAME}}'
        for el in tree.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," tst-fade-up ") or contains(concat(" ",normalize-space(@class)," ")," tst-fade-down ")]'):
            el.set('data-pp-reveal', '')
    if key == '04-elysia':
        # Framer's mixed portrait/landscape ticker retained 600px rows after
        # personalization. Normalize the photo frames without losing the rows.
        gallery=tree.xpath('//*[@id="gallery"]//*[@data-framer-name="Gallery"]')
        if gallery:
            gallery=gallery[0]
            rows=[]
            for track in gallery.xpath('.//ul'):
                photos=[]
                for item in list(track)[:4]:
                    images=item.xpath('.//img[@src]')
                    if images: photos.append(images[0].get('src'))
                if photos: rows.append(photos)
            if rows:
                for child in list(gallery): remove(child)
                gallery.set('class','pp-gallery-strips')
                gallery.attrib.pop('style',None)
                for photos in rows:
                    frame=etree.SubElement(gallery,'div',{'class':'pp-gallery-frame'})
                    track=etree.SubElement(frame,'ul',{'class':'pp-gallery-track'})
                    for src in photos:
                        item=etree.SubElement(track,'li',{'class':'pp-gallery-item'})
                        figure=etree.SubElement(item,'figure')
                        etree.SubElement(figure,'img',{'src':src,'alt':'Salon styling — template design reference','loading':'lazy','width':'640','height':'440'})
                        etree.SubElement(figure,'figcaption').text='Template photo · design reference'
        # The copied Framer page contains SSR animation start states. Without
        # hydration they stay translated by 200px and half transparent forever.
        for el in tree.xpath('//*[@style]'):
            style = el.get('style', '')
            if re.search(r'opacity:\s*(?:0(?:\.\d+)?|0?\.\d+)(?:;|$)', style) or 'will-change:transform' in style:
                el.set('data-pp-reveal', '')
                style = re.sub(r'(?:^|;)\s*(?:opacity|transform|will-change):[^;]*', '', style)
                el.set('style', style.lstrip(';'))
        for el in tree.xpath('//section[@id="gallery"]//p'):
            el.text = 'Design reference'
        introductions = tree.xpath('//section[@id="gallery"]//*[@data-framer-name="Gallery Title Group"]//p')
        if introductions:
            introductions[0].text = 'Gallery inspiration'
    # Every static appearance target receives reliable first-entry motion.
    for el in tree.xpath('//*[@data-w-id or @data-framer-appear-id or contains(concat(" ",normalize-space(@class)," ")," smoove ") or contains(concat(" ",normalize-space(@class)," ")," elementor-invisible ")]'):
        el.set('data-pp-reveal', '')
        if key == '01-nailsy':
            # One motion runtime prevents the copied Webflow timeline from
            # reapplying large offsets while personalized text changes height.
            el.attrib.pop('data-w-id',None)
    if key == '03-grand-restaurant':
        for el in tree.xpath('//*[@data-settings]'):
            settings = json.loads(el.get('data-settings','{}'))
            if settings.get('grandrestaurant_ext_is_smoove') == 'true':
                def value(prop, default=0):
                    return float(settings.get('grandrestaurant_ext_smoove_'+prop,{}).get('size',default))
                motion = (f'perspective({value("perspective",1000)}px) translate3d({value("translatex")}px,{value("translatey")}px,{value("translatez")}px) '
                          f'rotateX({value("rotatex")}deg) rotateY({value("rotatey")}deg) rotateZ({value("rotatez")}deg) scale({value("scalex",1)},{value("scaley",1)})')
                el.set('data-pp-reveal','')
                el.set('data-pp-configured-motion','')
                el.set('data-pp-min-width',str(settings.get('grandrestaurant_ext_smoove_disable','769')))
                style = re.sub(r'(?:^|;)\s*--pp-reveal-(?:from|duration):[^;]*','',el.get('style','')).strip(';')
                el.set('style',style+f';--pp-reveal-from:{motion};--pp-reveal-duration:{settings.get("grandrestaurant_ext_smoove_duration",1000)}ms')
            if settings.get('grandrestaurant_ext_is_fadeout_animation') == 'true':
                el.set('data-pp-scroll-speed',str(settings.get('grandrestaurant_ext_is_fadeout_animation_velocity',{}).get('size',0.2)))
    for el in tree.xpath('//a'):
        if el.get('href','') in ['#', '#pp-details'] and el.text_content().strip().lower() in ['order online', 'order', 'reservation', 'book now', 'call the salon']:
            el.set('href', '{{CONTACT}}')
        if el.text_content().strip().lower() == 'order online' or (el.text or '').strip().lower().startswith('contact to order'):
            for child in list(el): remove(child)
            el.text = 'Contact to order'
        if el.text_content().strip().lower() == 'view all services':
            el.set('href','#pp-services')
    for el in tree.xpath('//a[contains(@href,"#184768")]|//use[starts-with(@href,"./#")]'):
        if el.tag == 'use': el.set('href', el.get('href')[2:])
    bar = html.fromstring('<header class="pp-bar"><a class="pp-brand" href="#pp-top" aria-label="{{NAME}}">{{BRAND}}</a><nav class="pp-nav" aria-label="Main navigation"><a href="#pp-services">{{SERVICE_NAV}}</a><a href="#pp-details">Find us</a></nav><a class="pp-contact pp-header-contact" href="{{CONTACT}}" aria-label="Contact {{NAME}}">Contact us</a></header>')
    body.set('id', 'pp-top')
    body.insert(0, bar)
    body.insert(1, html.fromstring('<aside class="pp-note">A PicPulse website concept. Images show the template style; business details are subject to owner approval.</aside>'))
    detail = tree.xpath('//*[@id="pp-details"]')[0]
    detail.set('aria-label', 'Business details')
    # One service list is enough: remove duplicated data cards from the contact area.
    for el in list(detail):
        if el.tag == 'h3' and el.text_content().strip() == '{{MENU_LABEL}}':
            el.set('id', 'pp-services')
    if key in ['01-nailsy','04-elysia']:
        service_sections = [el for el in tree.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," pp-company ")]') if el != detail and el.xpath('.//h2')]
        if service_sections:
            service_section=service_sections[0]
            service_section.set('id','pp-services')
            service_section.set('class','pp-company pp-service-showcase')
            for child in list(service_section): remove(child)
            service_section.text=None
            service_section.append(html.fromstring('<h2>Services at {{NAME}}</h2>'))
            intro=html.fromstring('<p class="pp-service-intro">Explore our services. Contact the team to discuss availability and your next appointment.</p>')
            intro.tail='{{SERVICE_SHOWCASE}}'
            service_section.append(intro)
            for el in list(detail):
                if el.get('id') == 'pp-services' or ('pp-grid' in el.get('class','') and el.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," pp-card ")]')):
                    remove(el)
    style_link = html.fromstring('<link id="pp-presentation" rel="stylesheet" href="/templates/presentation.css?v=20261016-1">')
    head.append(style_link)
    body.append(html.fromstring('<script defer src="/templates/presentation.js?v=20261016-1"></script>'))
    path.write_text('<!doctype html>\n' + etree.tostring(tree, method='html', encoding='unicode'))

# Webflow's mirrored badge paths were relative to the source origin. Keep assets
# local even when its own runtime injects the badge.
for path in (ROOT/'public/templates/01-nailsy/assets').rglob('webflow.*.js'):
    content = path.read_text()
    fixed = content.replace('"/assets/d3e54v103j8qbb.cloudfront.net/', '"/templates/01-nailsy/assets/d3e54v103j8qbb.cloudfront.net/')
    if fixed != content: path.write_text(fixed)
print('Repaired four compiled templates; source originals and leads unchanged.')
