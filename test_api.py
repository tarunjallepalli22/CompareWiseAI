import requests

url = "http://127.0.0.1:8000/api/compare"
files = [
    ('files', ('Acme_Corp_Proposal.pdf', open('sample_proposals/Acme_Corp_Proposal.pdf', 'rb'), 'application/pdf')),
    ('files', ('TechNova_Proposal.pdf', open('sample_proposals/TechNova_Proposal.pdf', 'rb'), 'application/pdf'))
]

print("Sending request to CompareWise API...")
response = requests.post(url, files=files)

if response.status_code == 200:
    import json
    data = response.json()
    print("\n--- EXECUTIVE SUMMARY ---")
    print(data['comparison']['executive_summary'])
    print("\n--- RECOMMENDATION ---")
    print(data['comparison']['recommendation'])
    print("\n--- EXTRACTED VENDORS ---")
    for prop in data['proposals']:
        print(f"Vendor: {prop['vendor_name']} | Cost: {prop['total_cost']}")
else:
    print(f"Error {response.status_code}: {response.text}")
