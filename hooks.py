import re
from bs4 import BeautifulSoup

def on_page_content(html, page, config, files):
    """
    Build-time hook for MkDocs that flattens any malformed sections and
    groups content perfectly by H2 boundaries. H1 and introduction blocks
    stay at the root level of the article template.
    """
    soup = BeautifulSoup(html, 'html.parser')
    
    # Step 1: Flatten any existing malformed section wrappers to prevent bad nesting
    for broken_section in soup.find_all('section'):
        broken_section.unwrap()

    # Step 2: Grab the flat list of top-level child elements
    elements = list(soup.children)
    if not elements:
        return html

    new_soup = BeautifulSoup("", "html.parser")
    current_section = None

    for el in elements:
        # Keep H1 titles at the root level
        if el.name == 'h1':
            if current_section:
                new_soup.append(current_section)
                current_section = None
            new_soup.append(el)
            
        # When hitting an H2, close any open section and spin up a new sibling container
        elif el.name == 'h2':
            if current_section:
                new_soup.append(current_section)
            current_section = soup.new_tag("section")
            current_section.append(el)
            
        # Distribute paragraphs, blocks, tables, and blockquotes accurately
        else:
            if current_section is None:
                # Still in the document introduction zone under H1
                new_soup.append(el)
            else:
                # Belong inside the current active H2 subsection context
                current_section.append(el)

    # Append any remaining open section before finishing the compilation
    if current_section:
        new_soup.append(current_section)

    # Find the labels serving as mobile folder toggle controls and flag them as presentation-only
    for nav_label in soup.find_all("label", class_="md-nav__link"):
        next_sibling = nav_label.find_next_sibling("a")
        if next_sibling and nav_label.get_text(strip=True) == next_sibling.get_text(strip=True):
            # Hide the redundant checkbox driver element from screen reading tools
            nav_label["aria-hidden"] = "true"

    return str(new_soup)