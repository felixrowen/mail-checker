import sys
import json


def mock_check(domain):
    return {
        "domain": domain,
        "spf": {
            "status": "valid",
            "message": "SPF record is properly configured"
        },
        "dkim": {
            "status": "missing",
            "message": "No DKIM record found"
        },
        "dmarc": {
            "status": "invalid",
            "message": "DMARC record exists but is not properly formatted"
        },
        "mail_echo": {
            "status": "ok",
            "message": "Mail server responded successfully"
        }
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Domain argument is missing"}))
        sys.exit(1)

    domain = sys.argv[1]
    result = mock_check(domain)
    print(json.dumps(result))
    sys.exit(0)
