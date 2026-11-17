"""Compile the four supplied templates into company-data-driven pages."""
from pathlib import Path
from lxml import html, etree
import json,re,shutil
import openpyxl

ROOT=Path(__file__).resolve().parent
SOURCE=Path('/Users/thevirulakwan/Documents/_Pulse Studio/Automation')
PUBLIC=ROOT/'public'; PUBLIC.mkdir(exist_ok=True)
TEMPLATES=['01-nailsy','02-tastyc','03-grand-restaurant','04-elysia']
def remove(e):
    if e.getparent() is not None: e.getparent().remove(e)
def container(e):
    for a in e.iterancestors():
        if a.tag=='section' or a.get('data-element_type')=='section': return a
    return e.getparent()
def replace_content(e,markup):
    for child in list(e): e.remove(child)
    e.text=None
    for x in html.fragments_fromstring(markup):
        if not isinstance(x,str): e.append(x)

for key in TEMPLATES:
    dst=PUBLIC/'templates'/key; dst.mkdir(parents=True,exist_ok=True)
    shutil.copytree(SOURCE/key/'assets',dst/'assets',dirs_exist_ok=True)
    t=html.fromstring((SOURCE/key/'index.html').read_text())
    # Retain the original styling and local animation libraries, remove remote
    # services and hydration which would restore the source business data.
    for e in t.xpath('//script|//iframe|//form|//noscript|//base'):
        if e.tag=='script':
            src=e.get('src','')
            if not src or src.startswith('http') or 'local-preview' in src or key=='04-elysia': remove(e)
        else: remove(e)
    for e in t.xpath('//meta|//link'):
        if e.get('property','').startswith('og:') or e.get('name','').startswith('twitter:') or e.get('rel') in ['canonical','alternate','shortlink','pingback']: remove(e)
    head=t.find('head'); body=t.find('body')
    for title in head.xpath('./title'): title.text='{{NAME}} | Website concept'
    for m in head.xpath('./meta[@name="description"]'): m.set('content','{{DESCRIPTION}}')
    head.append(html.fromstring('<meta name="robots" content="noindex,nofollow">'))
    # Remove claims and commerce that cannot be attributed to the selected company.
    for e in list(t.xpath('//h1|//h2|//h3')):
        txt=' '.join(e.text_content().split()).lower()
        if any(s in txt for s in ['testimonials','visitors say','customers have to say','our blog','download our application','recipes of our chefs','subscribe our newsletter']):
            a=container(e)
            if a is not None and not a.xpath('.//h1'): remove(a)
    if key=='04-elysia':
        for e in t.xpath('//section[@id="reviews" or @id="good-to-know" or @id="training" or @id="why-elysia" or @id="new-looks" or @id="about" or @id="visit"]'): remove(e)
        for e in t.xpath('//section[@id="gallery"]//p'): e.text='Design reference gallery. Approved business photos will replace these images.'
    # Replace every original navigation, footer, logo, and service list.
    for e in list(t.xpath('//nav|//footer')): remove(e)
    for e in list(t.xpath('//*[@class]')):
        cls=e.get('class','').lower()
        if any(s in cls for s in ['navbar','promotion-wrapper','cart-wrapper','w-commerce','tst-counter','testimonials','footer-wrap','section-loop-anim','about-numbers-wrap','tst-wh-time','widget-tastyc-blog','widget-tastyc-numbers','tst-minicart','tst-preloader','tst-main-overlay','bsl-popup','tst-popup','tst-menu-frame']): remove(e)
        elif 'widget-tastyc-schedule' in cls: replace_content(e,'<div class="pp-company"><h2>Opening hours</h2>{{HOURS}}</div>')
    for e in list(t.xpath('//*[@id]')):
        if e.get('id') in ['option_wrapper','option_btn','loftloader-wrapper','footer-wrapper','woocommerce-mini-cart-wrapper']: remove(e)
    for e in list(t.xpath('//img')):
        ident=str(e.attrib).lower()
        if 'logo' in ident or 'loader image' in ident:
            e.set('src','{{LOGO}}'); e.set('alt','{{NAME}}'); e.attrib.pop('srcset',None)
    if key=='04-elysia':
        for e in t.xpath('//section[@id="services"]'):
            replace_content(e,'<div class="pp-company"><h2>Services at {{NAME}}</h2>{{SERVICES}}</div>')
    elif key=='01-nailsy':
        for e in list(t.xpath('//h2')):
            if e.text_content().strip() in ['Our Services','Products','Our Advantages']:
                a=container(e)
                if e.text_content().strip()=='Our Services': replace_content(a,'<div class="pp-company"><h2>Services at {{NAME}}</h2>{{SERVICES}}</div>')
                else: remove(a)
    # Text-node changes happen before token insertion is finished; unverified
    # sample paragraphs are never carried into the business copy.
    for text in list(t.xpath('//text()[not(ancestor::script) and not(ancestor::style)]')):
        val=str(text); stripped=val.strip(); parent=text.getparent()
        if not stripped: continue
        new=val
        new=re.sub(r'(?i)Nailsy(?:\s*128)?|Tastyc|Elysia(?: Hair & Nail Salon)?|Grand\s*Burger','{{NAME}}',new)
        if any(x in stripped.lower() for x in ['houston','texas','bloomingdale','akron','manchester','kingston','united kingdom','bookings@grandburger','310-999','212-666','65 (0)','emma newman','viktoria freeman','paul trueman','oscar oldman','layrena','maya tran','bertie capone','sarah jessica']): new='{{ADDRESS}}' if any(x in stripped.lower() for x in ['street','houston','texas','bloomingdale','akron','manchester','kingston']) else '{{NAME}}'
        elif len(stripped)>100 and '{{' not in stripped: new='{{DESCRIPTION}}'
        elif re.search(r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}',stripped): new='{{EMAIL_TEXT}}'
        elif re.search(r'\+\d[\d\s()\-]{7,}',stripped): new='{{PHONE_TEXT}}'
        elif re.search(r'\$\s*[\d,]|\d+\s*(AM|PM)|\d+\s*years|awards|honors|licensed specialists|certified products|visitors daily|deliveries monthly|positive feedback',stripped,re.I): new='Contact us for details'
        elif re.search(r'lorem|amet minim|quaerat|dolor sit|porro eveniet|rolorem|assumenda|tempore aspernatur|feugiat primis',stripped,re.I): new='{{DESCRIPTION}}'
        elif 'labore porro' in stripped.lower(): new=''
        elif stripped.lower() in ['experienced chefs','always fresh ingredients','our signature handmade beef patty','because we never play with someone’s health']: new='Contact the team for details'
        elif stripped.lower() in ['online shop','go to shop']: new='Contact us'
        if text.is_tail: parent.tail=new
        else: parent.text=new
    for e in t.xpath('//h1'):
        replace_content(e,'<span>{{NAME}}</span>')
    if key=='03-grand-restaurant':
        headings=t.xpath('//h2')
        if headings: headings[0].text='{{NAME}}'
        if len(headings)>1: headings[1].text='{{AREA}}'
    for e in t.xpath('//a'):
        href=e.get('href',''); text=e.text_content().lower()
        if 'get template' in text or 'purchase now' in text: remove(e); continue
        if href.startswith('mailto:'): e.set('href','{{MAILTO}}')
        elif href.startswith('tel:'): e.set('href','{{TEL}}')
        elif any(x in text for x in ['book','reservation','get started','contact','order']): e.set('href','{{CONTACT}}')
        elif not href.startswith('#') and not href.startswith('./assets/'): e.set('href','#pp-details')
        e.attrib.pop('target',None)
    for e in t.xpath('//img'):
        if '{{NAME}}' not in e.get('alt',''): e.set('alt','Template design reference image')
    # Neutralize demo inventory/food claims where the source design has cards.
    if key=='03-grand-restaurant':
        for e in t.xpath('//h2'):
            txt=e.text_content().strip().lower()
            if txt in ['fish','beef','veggie','burger','sauce','salad','original','fresh','super sunday','our burgers','the beef burger','tomato']: e.text='{{MENU_LABEL}}'
    for e in t.xpath('//*[contains(@class,"tst-count") or contains(@class,"tst-post-author") or contains(@class,"tst-post-card")]'): remove(e)
    css='''html{scroll-behavior:smooth}.pp-bar{position:sticky;top:0;z-index:99999;background:#fff;color:#222;padding:12px 5%;display:flex;gap:20px;align-items:center;justify-content:space-between;font:15px Arial}.pp-bar img{max-width:180px;max-height:52px}.pp-bar a{color:inherit}.pp-note{padding:10px 5%;background:#fff3cf;color:#443b2d;font:13px/1.5 Arial}.pp-company{max-width:1150px;margin:0 auto;padding:60px 24px;font:17px/1.7 Arial;color:#222;background:#fff}.pp-company h2{font-size:36px;color:inherit;margin:0 0 24px}.pp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:22px}.pp-card{border-bottom:1px solid #ddd;padding:16px 0}.pp-contact{display:inline-block;padding:12px 22px;background:#222;color:#fff!important;border-radius:6px;margin:10px 8px 10px 0}.pp-gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:15px}.pp-gallery img{width:100%;height:240px;object-fit:cover}.pp-price-note{font-size:13px;color:#666}.pp-mobile{display:none}@media(max-width:640px){.pp-bar{padding:10px 16px}.pp-bar span{display:none}.pp-company h2{font-size:28px}.pp-company{padding:35px 20px}}'''
    if key=='04-elysia': css+='[style*="opacity: 0"],[style*="opacity:0"]{opacity:1!important}#hero-h1 *{opacity:1!important;transform:none!important}#hero-h1 h1{font-size:clamp(36px,6vw,90px)!important;line-height:1.05!important}.framer-badge-container{display:none!important}'
    head.append(html.fromstring('<style>'+css+'</style>'))
    body.insert(0,html.fromstring('<div class="pp-bar"><a href="#"><img src="{{LOGO}}" alt="{{NAME}}"></a><span>{{AREA}}</span><a class="pp-contact" href="{{CONTACT}}">Contact {{NAME}}</a></div>'))
    body.insert(1,html.fromstring('<div class="pp-note">Independent PicPulse website concept for {{NAME}}. Template images are design references unless identified as approved business photos. Business details require final owner approval.</div>'))
    body.append(html.fromstring('<section class="pp-company" id="pp-details"><h2>{{NAME}}</h2><p>{{DESCRIPTION}}</p><div class="pp-grid"><div><h3>Location</h3><p>{{ADDRESS}}</p>{{DIRECTIONS}}</div><div><h3>Contact</h3>{{CONTACT_LINKS}}</div><div><h3>Opening hours</h3>{{HOURS}}</div></div><h3>{{MENU_LABEL}}</h3>{{SERVICES}}{{GALLERY}}{{SOCIALS}}<p class="pp-price-note">{{MISSING_NOTE}}</p></section>'))
    body.append(html.fromstring('<footer class="pp-company">{{NAME}} · Independent PicPulse proposal</footer>'))
    body.append(html.fromstring('<script>document.addEventListener("click",function(e){let a=e.target.closest("a");if(a&&a.getAttribute("href")==="#pp-details"){document.getElementById("pp-details").scrollIntoView({behavior:"smooth"})}});document.addEventListener("submit",e=>e.preventDefault(),true);</script>'))
    data=etree.tostring(t,method='html',encoding='unicode')
    # Logos, content, and template-specific assets will resolve on the hosted origin.
    data=re.sub(r'(["\'])\./assets/',r'\1/templates/'+key+'/assets/',data)
    data=data.replace('"assets/','"/templates/'+key+'/assets/')
    data=data.replace('./assets/','/templates/'+key+'/assets/')
    (dst/'index.html').write_text('<!doctype html>\n'+data)

wb=openpyxl.load_workbook('/Users/thevirulakwan/Documents/_Pulse Studio/Automation my/PicPulse_Colombo_Leads.xlsx',read_only=True,data_only=True)
rows=list(wb['Leads'].values); headers=list(rows[0]); leads=[]
for row in rows[1:]:
    lead={k:(v.isoformat() if hasattr(v,'isoformat') else v) for k,v in zip(headers,row)}
    if not lead.get('business_name'): continue
    lead['id']=lead['lead_id']; lead['name']=lead['business_name']
    lead['email_verified']=False; lead['details_approved']=False
    lead['logo_url']='';lead['logo_verified']=False
    lead['opening_hours']=[];lead['approved_images']=[]
    leads.append(lead)
(ROOT/'seed-leads.json').write_text(json.dumps(leads,indent=2,ensure_ascii=False))
import runpy
runpy.run_path(str(ROOT/'repair-template-presentation.py'),run_name='__main__')
print('Prepared four templates and',len(leads),'research leads. No email has been sent.')
