import dns.resolver
import dns.exception
import socket
import smtplib
from feedback import get_mail_echo_feedback


def check_mail_mx_only(domain):
    try:
        mx_records = dns.resolver.resolve(domain, 'MX')
        if not mx_records:
            result = {"status": "error",
                      "message": "No MX records found", "domain": domain}
            feedback = get_mail_echo_feedback(result)
            if feedback:
                result["feedback"] = feedback
            return result

        mx_servers = [str(record.exchange).rstrip('.')
                      for record in mx_records]
        return {
            "status": "ok",
            "message": f"MX records found: {', '.join(mx_servers[:3])}",
            "domain": domain
        }

    except dns.resolver.NXDOMAIN:
        result = {"status": "error",
                  "message": "Domain not found", "domain": domain}
        feedback = get_mail_echo_feedback(result)
        if feedback:
            result["feedback"] = feedback
        return result

    except dns.exception.DNSException as e:
        result = {"status": "error",
                  "message": f"DNS query failed: {str(e)}", "domain": domain}
        feedback = get_mail_echo_feedback(result)
        if feedback:
            result["feedback"] = feedback
        return result


def check_mail_echo_with_smtp(domain):
    try:
        mx_records = dns.resolver.resolve(domain, 'MX')
        if not mx_records:
            result = {"status": "error",
                      "message": "No MX records found", "domain": domain}
            feedback = get_mail_echo_feedback(result)
            if feedback:
                result["feedback"] = feedback
            return result

        primary_mx = min(mx_records, key=lambda x: x.preference)
        mx_host = str(primary_mx.exchange).rstrip('.')

        try:
            # Establish connection to SMTP server
            server = smtplib.SMTP(mx_host, 25, timeout=15)

            # Get initial server greeting
            greeting = server.getheader() if hasattr(
                server, 'getheader') else "Connected successfully"

            # Send EHLO/HELO command
            code, response = server.ehlo()
            if code != 250:
                code, response = server.helo()

            server_response = response.decode(
                'utf-8') if isinstance(response, bytes) else str(response)

            # Test basic SMTP commands
            smtp_info = {
                "greeting": greeting,
                "ehlo_response": server_response,
                "capabilities": []
            }

            # Check for common SMTP extensions
            if hasattr(server, 'esmtp_features'):
                smtp_info["capabilities"] = list(server.esmtp_features.keys())

            # Test STARTTLS if available
            if server.has_extn('STARTTLS'):
                smtp_info["starttls_available"] = True

            # Test authentication methods if available
            if server.has_extn('AUTH'):
                auth_methods = server.esmtp_features.get('auth', '').split()
                smtp_info["auth_methods"] = auth_methods

            # Close the connection properly
            server.quit()

            # Format the response
            response_lines = [f"Connected to {mx_host}"]
            if smtp_info.get("greeting"):
                response_lines.append(f"Greeting: {smtp_info['greeting']}")
            response_lines.append(
                f"EHLO Response: {smtp_info['ehlo_response']}")

            if smtp_info.get("capabilities"):
                response_lines.append(
                    f"Capabilities: {', '.join(smtp_info['capabilities'])}")
            if smtp_info.get("starttls_available"):
                response_lines.append("STARTTLS: Available")
            if smtp_info.get("auth_methods"):
                response_lines.append(
                    f"Auth Methods: {', '.join(smtp_info['auth_methods'])}")

            return {
                "status": "ok",
                "message": f"Mail server responding: {mx_host}",
                "echo": "\n".join(response_lines),
                "mx_host": mx_host,
                "domain": domain,
                "smtp_info": smtp_info
            }

        except smtplib.SMTPConnectError as e:
            mx_servers = [str(record.exchange).rstrip('.')
                          for record in mx_records]
            result = {
                "status": "warning",
                "message": f"MX records found ({', '.join(mx_servers[:3])}) but SMTP connection failed: {str(e)}",
                "domain": domain
            }
            feedback = get_mail_echo_feedback(result)
            if feedback:
                result["feedback"] = feedback
            return result

        except smtplib.SMTPServerDisconnected as e:
            mx_servers = [str(record.exchange).rstrip('.')
                          for record in mx_records]
            result = {
                "status": "warning",
                "message": f"MX records found ({', '.join(mx_servers[:3])}) but server disconnected: {str(e)}",
                "domain": domain
            }
            feedback = get_mail_echo_feedback(result)
            if feedback:
                result["feedback"] = feedback
            return result

        except (socket.timeout, socket.error, smtplib.SMTPException) as smtp_error:
            mx_servers = [str(record.exchange).rstrip('.')
                          for record in mx_records]
            result = {
                "status": "warning",
                "message": f"MX records found ({', '.join(mx_servers[:3])}) but mail server not responding: {str(smtp_error)}",
                "domain": domain
            }
            feedback = get_mail_echo_feedback(result)
            if feedback:
                result["feedback"] = feedback
            return result

    except dns.resolver.NXDOMAIN:
        result = {"status": "error",
                  "message": "Domain not found", "domain": domain}
        feedback = get_mail_echo_feedback(result)
        if feedback:
            result["feedback"] = feedback
        return result

    except dns.exception.DNSException as e:
        result = {"status": "error",
                  "message": f"DNS query failed: {str(e)}", "domain": domain}
        feedback = get_mail_echo_feedback(result)
        if feedback:
            result["feedback"] = feedback
        return result


def check_mail_echo(domain):
    return check_mail_mx_only(domain)
