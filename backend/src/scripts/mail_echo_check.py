import dns.resolver
import dns.exception


def check_mail_echo(domain):
    try:
        mx_records = dns.resolver.resolve(domain, 'MX')
        if not mx_records:
            return {"status": "error", "message": "No MX records found"}

        mx_servers = [str(record.exchange).rstrip('.')
                      for record in mx_records]
        return {"status": "ok", "message": f"MX records found: {', '.join(mx_servers[:3])}"}

    except (dns.resolver.NXDOMAIN, dns.exception.DNSException) as e:
        message = "No MX records found" if isinstance(
            e, dns.resolver.NXDOMAIN) else f"DNS query failed: {str(e)}"
        return {"status": "error", "message": message}
