import dns.resolver
import dns.exception


def check_dmarc(domain):
    try:
        answers = dns.resolver.resolve(f"_dmarc.{domain}", 'TXT')
        for rdata in answers:
            record = str(rdata).strip('"')
            if record.startswith('v=DMARC1'):
                return {"status": "valid", "message": f"DMARC record found: {record}"}
        return {"status": "missing", "message": "No DMARC record found"}
    except dns.resolver.NXDOMAIN:
        return {"status": "missing", "message": "No DMARC record found"}
    except dns.exception.DNSException as e:
        return {"status": "error", "message": f"DNS query failed: {str(e)}"}
