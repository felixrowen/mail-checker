def get_spf_feedback(result):
    """Analyze SPF result and provide feedback"""
    status = result.get("status", "")
    message = result.get("message", "").lower()
    record = result.get("record", "").lower()
    lookup_count = result.get("lookup_count", 0)

    if status == "missing" or any(x in message for x in ["no spf record", "not found"]):
        return {
            "error": "No SPF record",
            "fix": "Add v=spf1 record in DNS. Example: v=spf1 include:_spf.google.com ~all"
        }

    if lookup_count > 10 or any(x in message for x in ["too many lookups", "dns lookup limit", "exceeds the maximum limit"]):
        return {
            "error": "Too many DNS lookups",
            "fix": "Reduce includes. Use ip4: or ip6: directly. Use SPF flattening."
        }

    if record and "+all" in record:
        return {
            "error": "Use of +all",
            "fix": "Replace +all with ~all (soft fail) or -all (hard fail)."
        }

    if record and not any(record.endswith(x) for x in ["~all", "-all", "+all"]):
        return {
            "error": "Mechanism not ending with ~all or -all",
            "fix": "Always end SPF with one: ~all (soft fail) or -all (hard fail)."
        }

    if any(x in message for x in ["multiple spf", "more than one"]):
        return {
            "error": "Multiple SPF records",
            "fix": "Combine into a single record. Only one v=spf1 allowed."
        }

    if any(x in message for x in ["invalid", "malformed", "syntax error"]):
        return {
            "error": "Invalid mechanisms",
            "fix": "Validate syntax: v=spf1 ip4:xxx.xxx.xxx.xxx include:example.com -all"
        }

    return None


def get_dkim_feedback(result):
    """Analyze DKIM result and provide feedback"""
    status = result.get("status", "")
    message = result.get("message", "").lower()

    if status == "missing" or any(x in message for x in ["no dkim", "not found"]):
        return {
            "error": "Missing DKIM record",
            "fix": "Generate DKIM key, add public part in DNS under selector._domainkey.yourdomain.com"
        }

    if "selector" in message and any(x in message for x in ["not found", "wrong"]):
        return {
            "error": "Wrong selector",
            "fix": "Ensure you publish the correct selector used by your email provider."
        }

    if any(x in message for x in ["malformed", "invalid format", "syntax"]):
        return {
            "error": "Malformed record",
            "fix": "Use DNS tools or validators to verify the TXT is formatted correctly."
        }

    if any(x in message for x in ["key too short", "weak key", "1024"]):
        return {
            "error": "Key too short (<1024)",
            "fix": "Use at least 1024-bit (2048-bit recommended) RSA keys."
        }

    if any(x in message for x in ["no signature", "not signed"]):
        return {
            "error": "No signature in email",
            "fix": "Ensure signing is enabled in your email server or provider."
        }

    if any(x in message for x in ["expired", "rotation"]):
        return {
            "error": "Expired key rotation",
            "fix": "Periodically rotate DKIM keys and remove deprecated selectors."
        }

    return None


def get_dmarc_feedback(result):
    """Analyze DMARC result and provide feedback"""
    status = result.get("status", "")
    message = result.get("message", "").lower()

    if status == "missing" or any(x in message for x in ["no dmarc", "not found"]):
        return {
            "error": "No DMARC record",
            "fix": "Add one like: v=DMARC1; p=none; rua=mailto:dmarc@example.com"
        }

    if "dmarc record found:" in message:
        record = message.split("dmarc record found:")[1].strip()
        if "p=none" in record:
            return {
                "error": "Policy too weak (p=none)",
                "fix": "Change to quarantine or reject when ready."
            }
        if "rua=" not in record:
            return {
                "error": "No reporting addresses",
                "fix": "Add rua=mailto:you@example.com to monitor activity."
            }

    if any(x in message for x in ["alignment fail", "spf/dkim alignment"]):
        return {
            "error": "SPF/DKIM alignment fails",
            "fix": "Use proper 'From' domain that matches sending domain."
        }

    if any(x in message for x in ["malformed", "syntax", "invalid"]):
        return {
            "error": "Malformed syntax",
            "fix": "Validate using DMARC analyzer tools."
        }

    if any(x in message for x in ["strict alignment", "subdomain fail"]):
        return {
            "error": "Strict alignment fails",
            "fix": "Consider relaxed alignment: aspf=r; adkim=r."
        }

    return None
