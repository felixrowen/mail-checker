import dns.resolver
import dns.exception


def _get_spf_record(domain):
    try:
        answers = dns.resolver.resolve(domain, 'TXT')
        for rdata in answers:
            record = str(rdata).strip('"')
            if record.startswith('v=spf1'):
                return record
    except (dns.resolver.NXDOMAIN, dns.exception.DNSException):
        pass
    return None


def _add_lookup(lookups, lookup_type, domain, mechanism):
    lookups.append(
        {"type": lookup_type, "domain": domain, "mechanism": mechanism})
    return 1


def analyze_spf_lookups(spf_record, domain, visited_domains=None, depth=0):
    if visited_domains is None:
        visited_domains = set()

    if domain in visited_domains or depth > 10:
        return [], 0

    visited_domains.add(domain)
    lookups = []
    total_count = 0

    for mechanism in spf_record.split():
        mechanism = mechanism.lower()

        if mechanism.startswith('include:'):
            include_domain = mechanism[8:]
            total_count += _add_lookup(lookups,
                                       "include", include_domain, mechanism)

            include_record = _get_spf_record(include_domain)
            if include_record:
                nested_lookups, nested_count = analyze_spf_lookups(
                    include_record, include_domain, visited_domains.copy(), depth + 1
                )
                lookups.extend(nested_lookups)
                total_count += nested_count

        elif mechanism.startswith('a:') or mechanism == 'a':
            lookup_domain = mechanism[2:] if mechanism.startswith(
                'a:') else domain
            total_count += _add_lookup(lookups, "a", lookup_domain, mechanism)

        elif mechanism.startswith('mx:') or mechanism == 'mx':
            lookup_domain = mechanism[3:] if mechanism.startswith(
                'mx:') else domain
            total_count += _add_lookup(lookups, "mx", lookup_domain, mechanism)

        elif mechanism.startswith('exists:'):
            total_count += _add_lookup(lookups,
                                       "exists", mechanism[7:], mechanism)

        elif mechanism.startswith('redirect='):
            redirect_domain = mechanism[9:]
            total_count += _add_lookup(lookups,
                                       "redirect", redirect_domain, mechanism)

            redirect_record = _get_spf_record(redirect_domain)
            if redirect_record:
                nested_lookups, nested_count = analyze_spf_lookups(
                    redirect_record, redirect_domain, visited_domains.copy(), depth + 1
                )
                lookups.extend(nested_lookups)
                total_count += nested_count

    return lookups, total_count


def check_spf(domain):
    try:
        answers = dns.resolver.resolve(domain, 'TXT')
        spf_records = [str(rdata).strip('"') for rdata in answers if str(
            rdata).strip('"').startswith('v=spf1')]

        if not spf_records:
            return {"status": "missing", "message": "No SPF record found"}

        if len(spf_records) > 1:
            return {"status": "invalid", "message": "Multiple SPF records found (RFC violation)"}

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
            result.update({
                "status": "warning",
                "warning": f"DNS lookup count ({lookup_count}) exceeds the maximum limit of 10. This will result in a 'permerror' and SPF authentication failure."
            })

        return result

    except dns.resolver.NXDOMAIN:
        return {"status": "error", "message": "Domain not found"}
    except dns.exception.DNSException as e:
        return {"status": "error", "message": f"DNS query failed: {str(e)}"}
