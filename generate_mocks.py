from fpdf import FPDF
import os

def create_pdf(filename, content):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("helvetica", size=12)
    
    for line in content.split('\n'):
        if line.strip() == "":
            pdf.ln(5)
        else:
            pdf.multi_cell(w=190, h=10, text=line)
        
    pdf.output(filename)

acme_content = """Vendor Proposal: Acme Corp Cloud Hosting

1. Executive Summary
Acme Corp proposes a comprehensive cloud hosting solution tailored for your enterprise needs. We provide high-availability servers and top-tier support.

2. Vendor Name
Acme Corporation

3. Pricing and Total Cost
The total cost for the 3-year contract is $150,000. This includes all setup fees and 24/7 premium support. There is a $5,000 penalty for early termination.

4. Timeline
- Phase 1 (Setup): 2 weeks
- Phase 2 (Migration): 4 weeks
- Phase 3 (Go-Live): 1 week
Total timeline: 7 weeks

5. Service Level Agreement (SLA)
We guarantee 99.9% uptime. In case of failure to meet this SLA, a 5% credit will be applied to the following month's bill.

6. Terms and Conditions
The client must provide a 90-day written notice for cancellation. Acme Corp reserves the right to increase prices by up to 10% annually without prior consent. Data breach liabilities are capped at $50,000.

7. Key Deliverables
- 50 Dedicated Virtual Machines
- 5TB NVMe Storage
- Automated daily backups
"""

technova_content = """TechNova Infrastructure Services: Vendor Proposal

1. Introduction
TechNova offers a scalable and secure infrastructure to support your growing business.

2. Vendor Details
Vendor Name: TechNova Inc.

3. Financials
Total Cost of Ownership (TCO) over 3 years will be $135,000. No setup fees. Early termination will incur a flat $10,000 fee.

4. Implementation Timeline
The entire implementation, including data migration, will be completed in 10 weeks. 
- Discovery: 2 weeks
- Setup: 3 weeks
- Migration: 5 weeks

5. SLA
TechNova promises an industry-leading 99.99% uptime.

6. Legal and Risk Terms
TechNova assumes full liability for data breaches caused by our negligence, up to $2,000,000. All prices are locked in for the duration of the 3-year contract. Client data is strictly confidential and will not be shared with third parties under any circumstances. In the event of a dispute, arbitration must take place in the state of California.

7. Key Deliverables
- 40 Virtual Machines
- 10TB HDD Storage
- Weekly backups
- Basic email support
"""

def main():
    os.makedirs("sample_proposals", exist_ok=True)
    create_pdf("sample_proposals/Acme_Corp_Proposal.pdf", acme_content)
    create_pdf("sample_proposals/TechNova_Proposal.pdf", technova_content)
    print("Generated mock PDF proposals in 'sample_proposals' directory.")

if __name__ == "__main__":
    main()
