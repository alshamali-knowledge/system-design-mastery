import re
from bs4 import BeautifulSoup

def on_page_content(html, page, config, files):
    """Accessibility optimization: Semantic section nesting."""
    soup = BeautifulSoup(html, 'html.parser')
    
    for broken_section in soup.find_all('section'):
        broken_section.unwrap()

    elements = list(soup.children)
    if not elements:
        return html

    new_soup = BeautifulSoup("", "html.parser")
    stack = []
    heading_re = re.compile(r'^h([2-6])$')

    for el in elements:
        if el.name == 'h1':
            stack.clear()
            new_soup.append(el)
        else:
            match = heading_re.match(el.name or '')
            if match:
                current_level = int(match.group(1))
                while stack and stack[-1][0] >= current_level:
                    stack.pop()
                
                new_section = soup.new_tag("section")
                new_section.append(el)
                
                if stack:
                    stack[-1][1].append(new_section)
                else:
                    new_soup.append(new_section)
                
                stack.append((current_level, new_section))
            else:
                if stack:
                    stack[-1][1].append(el)
                else:
                    new_soup.append(el)

    for nav_label in new_soup.find_all("label", class_="md-nav__link"):
        next_sibling = nav_label.find_next_sibling("a")
        if next_sibling and nav_label.get_text(strip=True) == next_sibling.get_text(strip=True):
            nav_label["aria-hidden"] = "true"

    return str(new_soup)


def on_post_page(output, page, config):
    """Inject Google Site Verification meta tag."""
    verification_tag = '<meta name="google-site-verification" content="sMIWum850pdvHyZ6G67cr-Hm5rMnaisMBWQPhrguobg" />'
    
    if '<head>' in output:
        return output.replace('<head>', f'<head>\n    {verification_tag}', 1)
    
    return output