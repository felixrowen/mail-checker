import dns.resolver
import dns.exception


def analyze_spf_lookups(spf_record, domain, visited_domains=None, depth=0):
    if visited_domains is None:
        visited_domains = set()

    if domain in visited_domains or depth > 10:
        return [], 0

    visited_domains.add(domain)
    lookups = []
    total_count = 0

    # Parse SPF mechanisms that require DNS lookups
    mechanisms = spf_record.split()

    for mechanism in mechanisms:
        mechanism = mechanism.lower()

        # Include mechanism
        if mechanism.startswith('include:'):
            include_domain = mechanism[8:]
            lookups.append({
                "type": "include",
                "domain": include_domain,
                "mechanism": mechanism
            })
            total_count += 1

            # Recursively check included domain
            try:
                include_answers = dns.resolver.resolve(include_domain, 'TXT')
                for rdata in include_answers:
                    include_record = str(rdata).strip('"')
                    if include_record.startswith('v=spf1'):
                        nested_lookups, nested_count = analyze_spf_lookups(
                            include_record, include_domain, visited_domains.copy(), depth + 1
                        )
                        lookups.extend(nested_lookups)
                        total_count += nested_count
                        break
            except (dns.resolver.NXDOMAIN, dns.exception.DNSException):
                pass

        # A mechanism
        elif mechanism.startswith('a:') or mechanism == 'a':
            lookup_domain = mechanism[2:] if mechanism.startswith(
                'a:') else domain
            lookups.append({
                "type": "a",
                "domain": lookup_domain,
                "mechanism": mechanism
            })
            total_count += 1

        # MX mechanism
        elif mechanism.startswith('mx:') or mechanism == 'mx':
            lookup_domain = mechanism[3:] if mechanism.startswith(
                'mx:') else domain
            lookups.append({
                "type": "mx",
                "domain": lookup_domain,
                "mechanism": mechanism
            })
            total_count += 1

        # EXISTS mechanism
        elif mechanism.startswith('exists:'):
            exists_domain = mechanism[7:]
            lookups.append({
                "type": "exists",
                "domain": exists_domain,
                "mechanism": mechanism
            })
            total_count += 1

        # Redirect modifier
        elif mechanism.startswith('redirect='):
            redirect_domain = mechanism[9:]
            lookups.append({
                "type": "redirect",
                "domain": redirect_domain,
                "mechanism": mechanism
            })
            total_count += 1

            # Recursively check redirected domain
            try:
                redirect_answers = dns.resolver.resolve(redirect_domain, 'TXT')
                for rdata in redirect_answers:
                    redirect_record = str(rdata).strip('"')
                    if redirect_record.startswith('v=spf1'):
                        nested_lookups, nested_count = analyze_spf_lookups(
                            redirect_record, redirect_domain, visited_domains.copy(), depth + 1
                        )
                        lookups.extend(nested_lookups)
                        total_count += nested_count
                        break
            except (dns.resolver.NXDOMAIN, dns.exception.DNSException):
                pass

    return lookups, total_count


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
            spf_record = spf_records[0]
            lookups, lookup_count = analyze_spf_lookups(spf_record, domain)

            result = {
                "status": "valid",
                "message": f"SPF record found: {spf_record}",
                "record": spf_record,
                "lookups": lookups,
                "lookup_count": lookup_count
            }

            if lookup_count > 10:
                result["status"] = "warning"
                result["warning"] = f"DNS lookup count ({lookup_count}) exceeds the maximum limit of 10. This will result in a 'permerror' and SPF authentication failure."

            return result

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
