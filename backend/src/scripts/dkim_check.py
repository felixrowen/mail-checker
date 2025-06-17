import dns.resolver
import dns.exception
from feedback import get_dkim_feedback


def check_dkim(domain):
    selectors = ['default', 'google', 'k1', 'k2', 's1', 's2', 'dkim', 'mail',
                 'smtp', 'email', 'selector1', 'selector2', 'mxvault']
    found_records = []

    for selector in selectors:
        try:
            answers = dns.resolver.resolve(
                f"{selector}._domainkey.{domain}", 'TXT')
            for rdata in answers:
                record = str(rdata).strip('"')
                if record.startswith('v=DKIM1') or ('k=' in record and 'p=' in record):
                    found_records.append(
                        {"selector": selector, "record": record})
                    break
        except (dns.resolver.NXDOMAIN, dns.exception.DNSException):
            continue

    result = {
        "status": "valid" if found_records else "missing",
        "message": (f"DKIM records found for selectors: {', '.join(r['selector'] for r in found_records)}"
                    if found_records else "No DKIM records found for common selectors"),
        **({"records": found_records} if found_records else {})
    }

    feedback = get_dkim_feedback(result)
    if feedback:
        result["feedback"] = feedback

    return result
