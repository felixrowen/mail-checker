def get_spf_feedback(result):
    """Analyze SPF result and provide feedback"""
    status = result.get("status", "")
    message = result.get("message", "").lower()
    record = result.get("record", "").lower()
    lookup_count = result.get("lookup_count", 0)
    domain = result.get("domain", "yourdomain.com")

    if status == "missing" or any(x in message for x in ["no spf record", "not found"]):
        return {"error": "No SPF record found", "fix": f"Create an SPF record for {domain} to authorize email-sending sources. This ensures proper email authentication and improves delivery success rates."}

    if any(x in message for x in ["dns query failed", "dns response does not contain an answer", "dns resolution failed"]):
        return {"error": "No valid SPF record found", "fix": f"Create a valid SPF record for {domain} using an SPF generator, ensuring all email-sending sources are correctly configured for email authentication to guarantee successful email delivery."}

    if lookup_count > 10 or any(x in message for x in ["too many lookups", "dns lookup limit", "exceeds the maximum limit"]):
        return {"error": "Too many DNS lookups", "fix": "Reduce includes. Use ip4: or ip6: directly. Use SPF flattening."}

    if record and "+all" in record:
        return {"error": "Use of +all", "fix": "Replace +all with ~all (soft fail) or -all (hard fail)."}

    if record and not any(record.strip().endswith(x) for x in ["~all", "-all", "+all"]):
        return {"error": "Mechanism not ending with ~all or -all", "fix": "Always end SPF with one: ~all (soft fail) or -all (hard fail)."}

    if any(x in message for x in ["multiple spf", "more than one"]):
        return {"error": "Multiple SPF records", "fix": "Combine into a single record. Only one v=spf1 allowed."}

    if any(x in message for x in ["invalid", "malformed", "syntax error"]):
        return {"error": "Invalid mechanisms", "fix": f"Validate syntax: v=spf1 ip4:xxx.xxx.xxx.xxx include:_spf.google.com -all for {domain}"}

    return None


def get_dkim_feedback(result):
    """Analyze DKIM result and provide feedback"""
    status = result.get("status", "")
    message = result.get("message", "").lower()
    domain = result.get("domain", "yourdomain.com")
    selector = result.get("selector", "default")

    if status == "missing" or any(x in message for x in ["no dkim", "not found"]):
        return {"error": "Missing DKIM record", "fix": f"Generate DKIM key, add public part in DNS under {selector}._domainkey.{domain}"}

    if "selector" in message and any(x in message for x in ["not found", "wrong"]):
        return {"error": "Wrong selector", "fix": "Ensure you publish the correct selector used by your email provider."}

    if any(x in message for x in ["malformed", "invalid format", "syntax"]):
        return {"error": "Malformed record", "fix": "Use DNS tools or validators to verify the TXT is formatted correctly."}

    if any(x in message for x in ["key too short", "weak key", "1024"]):
        return {"error": "Key too short (<1024)", "fix": "Use at least 1024-bit (2048-bit recommended) RSA keys."}

    if any(x in message for x in ["no signature", "not signed"]):
        return {"error": "No signature in email", "fix": "Ensure signing is enabled in your email server or provider."}

    if any(x in message for x in ["expired", "rotation"]):
        return {"error": "Expired key rotation", "fix": "Periodically rotate DKIM keys and remove deprecated selectors."}

    return None


def get_dmarc_feedback(result):
    """Analyze DMARC result and provide feedback"""
    status = result.get("status", "")
    message = result.get("message", "").lower()
    domain = result.get("domain", "yourdomain.com")

    if status == "missing" or any(x in message for x in ["no dmarc", "not found"]):
        return {"error": "No DMARC record", "fix": f"Add one like: v=DMARC1; p=none; rua=mailto:dmarc@{domain}"}

    if any(x in message for x in ["dns query failed", "dns response does not contain an answer", "dns resolution failed", "all nameservers failed", "dns operation timed out", "servfail", "timeout"]):
        return {"error": "DNS query failed", "fix": f"DNS servers cannot resolve _dmarc.{domain}. Check DNS configuration, try public DNS servers (8.8.8.8, 1.1.1.1), or contact your DNS provider to resolve connectivity issues."}

    if "dmarc record found:" in message:
        record = message.split("dmarc record found:")[1].strip()
        if "p=none" in record:
            return {"error": "Policy too weak (p=none)", "fix": "Change to quarantine or reject when ready."}
        if "rua=" not in record:
            return {"error": "No reporting addresses", "fix": f"Add rua=mailto:dmarc@{domain} to monitor activity."}

    if any(x in message for x in ["alignment fail", "spf/dkim alignment"]):
        return {"error": "SPF/DKIM alignment fails", "fix": "Use proper 'From' domain that matches sending domain."}

    if any(x in message for x in ["malformed", "syntax", "invalid"]):
        return {"error": "Malformed syntax", "fix": "Validate using DMARC analyzer tools."}

    if any(x in message for x in ["strict alignment", "subdomain fail"]):
        return {"error": "Strict alignment fails", "fix": "Consider relaxed alignment: aspf=r; adkim=r."}

    return None


def get_mail_echo_feedback(result):
    status = result.get("status", "")
    message = result.get("message", "").lower()
    domain = result.get("domain", "yourdomain.com")

    if any(x in message for x in ["dns query failed", "dns response does not contain an answer", "dns resolution failed", "no mx records", "mx record not found"]):
        return {"error": "No MX records found", "fix": f"Add MX records in DNS pointing to your mail server to enable email delivery. Example: {domain} MX 10 mail.{domain}"}

    if status == "warning" and "not responding" in message:
        return {"error": "Mail server not responding", "fix": "Check if your mail server is running and accessible on port 25. Verify firewall settings and server configuration."}

    if any(x in message for x in ["timeout", "connection timed out"]):
        return {"error": "DNS timeout", "fix": "DNS server is not responding. Check network connectivity or try different DNS servers."}

    if any(x in message for x in ["nxdomain", "domain not found"]):
        return {"error": "Domain not found", "fix": f"Verify {domain} is correct and properly registered. Check domain registration status."}

    return None
