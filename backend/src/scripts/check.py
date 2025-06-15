import sys
import json
import dns.resolver
import dns.exception
from email.mime.text import MIMEText


def check_spf(domain):
    try:
        answers = dns.resolver.resolve(domain, 'TXT')
        spf_records = []
        
        for rdata in answers:
            txt_string = str(rdata).strip('"')
            if txt_string.startswith('v=spf1'):
                spf_records.append(txt_string)
        
        if not spf_records:
            return {
                "status": "missing",
                "message": "No SPF record found"
            }
        elif len(spf_records) > 1:
            return {
                "status": "invalid",
                "message": "Multiple SPF records found (RFC violation)"
            }
        else:
            return {
                "status": "valid",
                "message": f"SPF record found: {spf_records[0]}"
            }
    except dns.resolver.NXDOMAIN:
        return {
            "status": "error",
            "message": "Domain not found"
        }
    except dns.exception.DNSException as e:
        return {
            "status": "error",
            "message": f"DNS query failed: {str(e)}"
        }


def check_dkim(domain):
    common_selectors = [
        'default', 'google', 'k1', 'k2', 's1', 's2', 'dkim', 'mail',
        'smtp', 'email', 'selector1', 'selector2', 'mxvault'
    ]
    
    found_selectors = []
    
    for selector in common_selectors:
        try:
            dkim_domain = f"{selector}._domainkey.{domain}"
            answers = dns.resolver.resolve(dkim_domain, 'TXT')
            
            for rdata in answers:
                txt_string = str(rdata).strip('"')
                if txt_string.startswith('v=DKIM1') or ('k=' in txt_string and 'p=' in txt_string):
                    found_selectors.append(selector)
                    break
                    
        except (dns.resolver.NXDOMAIN, dns.exception.DNSException):
            continue
    
    if found_selectors:
        return {
            "status": "valid",
            "message": f"DKIM records found for selectors: {', '.join(found_selectors)}"
        }
    else:
        return {
            "status": "missing",
            "message": "No DKIM records found for common selectors"
        }


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


def check_mail_echo(domain):
    try:
        mx_records = dns.resolver.resolve(domain, 'MX')
        if not mx_records:
            return {
                "status": "error",
                "message": "No MX records found"
            }
        
        mx_servers = [str(record.exchange).rstrip('.') for record in mx_records]
        return {
            "status": "ok",
            "message": f"MX records found: {', '.join(mx_servers[:3])}"
        }
        
    except dns.resolver.NXDOMAIN:
        return {
            "status": "error",
            "message": "No MX records found"
        }
    except dns.exception.DNSException as e:
        return {
            "status": "error",
            "message": f"DNS query failed: {str(e)}"
        }


def parse_domain(domain):
    if domain.startswith(('http://', 'https://')):
        domain = domain.split('//', 1)[1]
    
    domain = domain.split('/')[0]
    domain = domain.split(':')[0]
    
    if domain.startswith('www.'):
        domain = domain[4:]
    
    return domain


def check_domain(domain):
    clean_domain = parse_domain(domain)
    return {
        "spf": check_spf(clean_domain),
        "dkim": check_dkim(clean_domain),
        "dmarc": check_dmarc(clean_domain),
        "mail_echo": check_mail_echo(clean_domain)
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Domain argument is missing"}))
        sys.exit(1)

    domain = sys.argv[1]
    result = check_domain(domain)
    print(json.dumps(result))
    sys.exit(0)
