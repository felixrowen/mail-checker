import dns.resolver
import dns.exception


def check_dkim(domain):
    common_selectors = [
        'default', 'google', 'k1', 'k2', 's1', 's2', 'dkim', 'mail',
        'smtp', 'email', 'selector1', 'selector2', 'mxvault'
    ]

    found_records = []

    for selector in common_selectors:
        try:
            dkim_domain = f"{selector}._domainkey.{domain}"
            answers = dns.resolver.resolve(dkim_domain, 'TXT')

            for rdata in answers:
                txt_string = str(rdata).strip('"')
                if txt_string.startswith('v=DKIM1') or ('k=' in txt_string and 'p=' in txt_string):
                    found_records.append({
                        "selector": selector,
                        "record": txt_string
                    })
                    break

        except (dns.resolver.NXDOMAIN, dns.exception.DNSException):
            continue

    if found_records:
        return {
            "status": "valid",
            "message": f"DKIM records found for selectors: {', '.join([r['selector'] for r in found_records])}",
            "records": found_records
        }
    else:
        return {
            "status": "missing",
            "message": "No DKIM records found for common selectors"
        }
