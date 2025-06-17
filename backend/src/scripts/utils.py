def parse_domain(domain):
    """Parse and clean domain from various input formats"""
    if domain.startswith(('http://', 'https://')):
        domain = domain.split('//', 1)[1]

    domain = domain.split('/')[0]
    domain = domain.split(':')[0]

    if domain.startswith('www.'):
        domain = domain[4:]

    return domain
