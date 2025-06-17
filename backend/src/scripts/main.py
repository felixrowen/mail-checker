import sys
import json
from spf_check import check_spf
from dkim_check import check_dkim
from dmarc_check import check_dmarc
from mail_echo_check import check_mail_echo
from utils import parse_domain


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

    print(json.dumps(check_domain(sys.argv[1])))
