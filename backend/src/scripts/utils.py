def parse_domain(domain):
    if domain.startswith(('http://', 'https://')):
        domain = domain.split('//', 1)[1]

    domain = domain.split('/')[0].split(':')[0]
    return domain[4:] if domain.startswith('www.') else domain
