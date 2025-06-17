import dns.resolver
import dns.exception
from feedback import get_dmarc_feedback


def _create_result_with_feedback(status, message):
    result = {"status": status, "message": message}
    feedback = get_dmarc_feedback(result)
    if feedback:
        result["feedback"] = feedback
    return result


def check_dmarc(domain):
    try:
        answers = dns.resolver.resolve(f"_dmarc.{domain}", 'TXT')
        for rdata in answers:
            record = str(rdata).strip('"')
            if record.startswith('v=DMARC1'):
                return _create_result_with_feedback("valid", f"DMARC record found: {record}")
        return _create_result_with_feedback("missing", "No DMARC record found")
    except (dns.resolver.NXDOMAIN, dns.exception.DNSException) as e:
        message = "No DMARC record found" if isinstance(
            e, dns.resolver.NXDOMAIN) else f"DNS query failed: {str(e)}"
        status = "missing" if isinstance(e, dns.resolver.NXDOMAIN) else "error"
        return _create_result_with_feedback(status, message)
