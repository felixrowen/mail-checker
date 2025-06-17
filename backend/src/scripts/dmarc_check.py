import dns.resolver
import dns.exception


def check_dmarc(domain):
    try:
        dmarc_domain = f"_dmarc.{domain}"
        answers = dns.resolver.resolve(dmarc_domain, 'TXT')

        for rdata in answers:
            txt_string = str(rdata).strip('"')
            if txt_string.startswith('v=DMARC1'):
                return {
                    "status": "valid",
                    "message": f"DMARC record found: {txt_string}"
                }

        return {
            "status": "missing",
            "message": "No DMARC record found"
        }
    except dns.resolver.NXDOMAIN:
        return {
            "status": "missing",
            "message": "No DMARC record found"
        }
    except dns.exception.DNSException as e:
        return {
            "status": "error",
            "message": f"DNS query failed: {str(e)}"
        }
