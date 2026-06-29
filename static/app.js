document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const fileList = document.getElementById('file-list');
    const compareBtn = document.getElementById('compare-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    const uploadSection = document.getElementById('upload-section');
    const loadingSection = document.getElementById('loading-section');
    const resultsSection = document.getElementById('results-section');
    const themeToggle = document.getElementById('theme-toggle');
    
    let selectedFiles = [];
    let progressInterval;

    // --- Theme Toggle ---
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        themeToggle.textContent = '🌙 Dark Mode';
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        if (document.body.classList.contains('light-mode')) {
            localStorage.setItem('theme', 'light');
            themeToggle.textContent = '🌙 Dark Mode';
        } else {
            localStorage.setItem('theme', 'dark');
            themeToggle.textContent = '☀️ Light Mode';
        }
    });

    // --- Navigation Handling ---
    const navDashboard = document.getElementById('nav-dashboard');
    const navRecommended = document.getElementById('nav-recommended');
    const dashboardView = document.getElementById('dashboard-view');
    const recommendedView = document.getElementById('recommended-view');

    function showDashboard() {
        dashboardView.classList.remove('hidden');
        recommendedView.classList.add('hidden');
        navDashboard.classList.add('active');
        navRecommended.classList.remove('active');
    }

    function showRecommended() {
        dashboardView.classList.add('hidden');
        recommendedView.classList.remove('hidden');
        navDashboard.classList.remove('active');
        navRecommended.classList.add('active');
    }

    navDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        showDashboard();
    });

    navRecommended.addEventListener('click', (e) => {
        e.preventDefault();
        showRecommended();
    });

    // --- Drag and Drop Handling ---
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });

    dropZone.addEventListener('drop', (e) => {
        handleFiles(e.dataTransfer.files);
    });

    // --- Click Upload Handling ---
    browseBtn.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('click', (e) => {
        if(e.target !== browseBtn) fileInput.click();
    });

    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    // --- File Processing ---
    function handleFiles(files) {
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        const allowedExtensions = ['.pdf', '.docx', '.xlsx'];
        
        const newFiles = Array.from(files).filter(file => {
            return allowedTypes.includes(file.type) || allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        });
        
        if (newFiles.length !== files.length) {
            alert('Only PDF, DOCX, and XLSX files are supported.');
        }

        selectedFiles = [...selectedFiles, ...newFiles];
        updateFileUI();
    }

    function updateFileUI() {
        fileList.innerHTML = '';
        
        selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-item-name">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    ${file.name}
                </div>
                <button class="remove-file" onclick="removeFile(${index})">×</button>
            `;
            fileList.appendChild(fileItem);
        });

        // Enable compare button if at least 2 files are selected
        compareBtn.disabled = selectedFiles.length < 2;
    }

    window.removeFile = function(index) {
        selectedFiles.splice(index, 1);
        updateFileUI();
    };

    // --- Recommendation Handling ---
    document.querySelectorAll('.add-pdf-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const url = e.target.getAttribute('data-url');
            const name = e.target.getAttribute('data-name');
            
            try {
                // Change button text to show loading
                const originalText = e.target.textContent;
                e.target.textContent = '...';
                e.target.disabled = true;

                const response = await fetch(url);
                const blob = await response.blob();
                const file = new File([blob], name, { type: 'application/pdf' });
                
                // Check if file is already added
                if (!selectedFiles.some(f => f.name === file.name)) {
                    selectedFiles.push(file);
                    updateFileUI();
                }
                
                // Restore button
                e.target.textContent = '✓ Added';
                setTimeout(() => {
                    e.target.textContent = originalText;
                    e.target.disabled = false;
                }, 2000);
                
                // Return to dashboard and scroll to upload section smoothly
                showDashboard();
                uploadSection.scrollIntoView({ behavior: 'smooth' });

            } catch (error) {
                alert('Failed to add PDF: ' + error.message);
                e.target.textContent = '+ Add';
                e.target.disabled = false;
            }
        });
    });

    // --- API Integration ---
    compareBtn.addEventListener('click', async () => {
        if (selectedFiles.length < 2) return;

        // Show Loading
        uploadSection.classList.add('hidden');
        loadingSection.classList.remove('hidden');

        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        // Simulated frontend progress (eases to 90%, snaps to 100% on done)
        const loadingText = document.getElementById('loading-text');
        const progressBarFill = document.getElementById('progress-bar-fill');
        const loadingSubtext = document.getElementById('loading-subtext');

        const stages = [
            { pct: 8,  msg: '🔍 Reading uploaded files...' },
            { pct: 22, msg: '📄 Extracting text from documents...' },
            { pct: 40, msg: '🤖 Analyzing proposals with Ollama AI...' },
            { pct: 60, msg: '📊 Comparing vendor metrics...' },
            { pct: 75, msg: '⚖️ Weighing costs and SLA terms...' },
            { pct: 88, msg: '💡 Generating executive summary...' },
            { pct: 93, msg: '✨ Finalizing AI recommendation...' },
        ];

        let currentPct = 0;
        let stageIdx = 0;

        function setProgress(pct, msg) {
            currentPct = pct;
            const display = Math.round(pct);
            progressBarFill.style.width = pct + '%';
            loadingSubtext.textContent = display + '%';
            if (msg) loadingText.textContent = msg;
        }

        // Smooth tick — advances 0.4% every 300ms, triggers stage messages at thresholds
        progressInterval = setInterval(() => {
            if (stageIdx < stages.length && currentPct >= stages[stageIdx].pct) {
                setProgress(stages[stageIdx].pct, stages[stageIdx].msg);
                stageIdx++;
            } else if (currentPct < 93) {
                setProgress(Math.min(currentPct + 0.4, 93), null);
            }
        }, 300);

        try {
            const response = await fetch('/api/compare', {
                method: 'POST',
                body: formData
            });

            clearInterval(progressInterval);
            setProgress(100, '✅ Analysis Complete!');
            await new Promise(r => setTimeout(r, 600)); // brief pause to show 100%

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to process proposals');
            }

            const data = await response.json();
            renderResults(data);

            // Show Results
            loadingSection.classList.add('hidden');
            resultsSection.classList.remove('hidden');

        } catch (error) {
            clearInterval(progressInterval);
            alert('Error: ' + error.message);
            loadingSection.classList.add('hidden');
            uploadSection.classList.remove('hidden');
        }
    });

    // --- Render Results ---
    function renderResults(data) {
        let { proposals } = data;
        let comparison = data.comparison || {};
        
        // Handle cases where the backend/LLM accidentally returned the comparison as a stringified JSON
        if (typeof comparison === 'string') {
            try {
                comparison = JSON.parse(comparison);
            } catch (e) {
                console.error("Failed to parse comparison string:", e);
            }
        }

        // Handle cases where AI wraps the response in a root key (e.g., { "ComparisonSummary": { ... } })
        if (comparison && !comparison.executive_summary && !comparison.recommendation && !comparison.summary) {
            const keys = Object.keys(comparison);
            if (keys.length === 1 && typeof comparison[keys[0]] === 'object') {
                console.log("Unwrapping nested comparison key:", keys[0]);
                comparison = comparison[keys[0]];
            }
        }

        console.log("Final comparison object for rendering:", comparison);

        // 1. Executive Summary (Handling various naming conventions the AI might use)
        const execSummary = comparison.executive_summary || comparison.executiveSummary || comparison.summary || comparison.ExecutiveSummary || "No summary provided.";
        const recommendation = comparison.recommendation || comparison.Recommendation || "No recommendation provided.";
        
        document.getElementById('exec-summary-content').textContent = execSummary;
        document.getElementById('recommendation-content').textContent = recommendation;

        // 2. Comparison Table
        const tableHeaders = document.getElementById('table-headers');
        const tableBody = document.getElementById('table-body');
        
        // Clear previous
        tableHeaders.innerHTML = '<th>Criteria</th>';
        tableBody.innerHTML = '';

        // Add headers
        proposals.forEach(p => {
            const th = document.createElement('th');
            th.textContent = p.vendor_name || 'Unknown Vendor';
            tableHeaders.appendChild(th);
        });

        // Define criteria to show in table
        const criteria = [
            { key: 'total_cost', label: 'Total Cost' },
            { key: 'timeline', label: 'Timeline' },
            { key: 'sla', label: 'SLA' },
            { key: 'key_deliverables', label: 'Key Deliverables', isList: true }
        ];

        // Add rows
        criteria.forEach(crit => {
            const tr = document.createElement('tr');
            const tdLabel = document.createElement('td');
            tdLabel.innerHTML = `<strong>${crit.label}</strong>`;
            tr.appendChild(tdLabel);

            proposals.forEach(p => {
                const td = document.createElement('td');
                const val = p[crit.key];
                if (crit.isList) {
                    let items = Array.isArray(val) ? val : [val];
                    if (!val) items = [];
                    td.innerHTML = `<ul style="padding-left:1rem">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
                } else {
                    td.textContent = val || 'N/A';
                }
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });

        // 3. Pros/Cons and Risks Grid
        const detailsGrid = document.getElementById('details-grid');
        detailsGrid.innerHTML = '';

        let prosConsArray = [];
        const rawProsCons = comparison.pros_cons || comparison.prosCons || comparison.pros_and_cons || comparison.ProsCons;
        
        if (Array.isArray(rawProsCons)) {
            prosConsArray = rawProsCons;
        } else if (rawProsCons && typeof rawProsCons === 'object') {
            // Handle cases where AI returns a dictionary instead of an array
            for (const [key, value] of Object.entries(rawProsCons)) {
                prosConsArray.push({
                    vendor_name: key,
                    pros: value.pros || value.Pros || [],
                    cons: value.cons || value.Cons || []
                });
            }
        }

        proposals.forEach((p, index) => {
            const name = p.vendor_name || `Vendor ${index + 1}`;
            
            // Try to match by name, otherwise fallback to index
            let prosCons = { pros: [], cons: [] };
            const matchedItem = prosConsArray.find(item => {
                // Fuzzy matching for vendor names
                const itemName = item.vendor_name || item.vendorName || item.name || "";
                return itemName.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(itemName.toLowerCase());
            });
            
            if (matchedItem) {
                prosCons = matchedItem;
            } else if (prosConsArray[index]) {
                prosCons = prosConsArray[index];
            }
            
            const pros = Array.isArray(prosCons.pros) ? prosCons.pros : [prosCons.pros].filter(Boolean);
            const cons = Array.isArray(prosCons.cons) ? prosCons.cons : [prosCons.cons].filter(Boolean);
            
            const card = document.createElement('div');
            card.className = 'vendor-card';
            
            let risksHtml = '';
            let riskClauses = Array.isArray(p.risk_clauses) ? p.risk_clauses : [p.risk_clauses].filter(Boolean);
            if (riskClauses.length > 0) {
                risksHtml = `
                    <div class="risks-box">
                        <h4><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Identified Risks</h4>
                        <ul>
                            ${riskClauses.map(r => `<li>${r}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            const prosHtml = pros.length > 0 ? pros.map(p => `<li>${p}</li>`).join('') : '<li>No specific pros identified.</li>';
            const consHtml = cons.length > 0 ? cons.map(c => `<li>${c}</li>`).join('') : '<li>No specific cons identified.</li>';

            card.innerHTML = `
                <h3>${name}</h3>
                <div class="pro-con-list pros">
                    <h4>Pros</h4>
                    <ul>${prosHtml}</ul>
                </div>
                <div class="pro-con-list cons">
                    <h4>Cons</h4>
                    <ul>${consHtml}</ul>
                </div>
                ${risksHtml}
            `;
            
            detailsGrid.appendChild(card);
        });
    }

    // --- Reset ---
    resetBtn.addEventListener('click', () => {
        selectedFiles = [];
        updateFileUI();
        fileInput.value = '';
        resultsSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
    });
});
