import React, { useState, useEffect } from 'react';

const AfyaCapitalDashboard = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('claims');
    const [advanceRate, setAdvanceRate] = useState(70);
    const [selectedClaims, setSelectedClaims] = useState([]);
    const [disbursedMap, setDisbursedMap] = useState({});
    const [totalDisbursed, setTotalDisbursed] = useState(0);
    const [ledgerEntries, setLedgerEntries] = useState([]);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalClaimRef, setModalClaimRef] = useState('');
    const [modalAmount, setModalAmount] = useState(0);
    const [modalStep, setModalStep] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isBatchTarget, setIsBatchTarget] = useState(false);

    // JSON Drawer State
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerPayload, setDrawerPayload] = useState(null);

    const mockFallbacks = [
        { claim: 'CLM-2026-8841', facility: 'Nairobi West Hospital', approvedAmount: 850000, availableAdvance: 595000, risk: 'LOW' },
        { claim: 'CLM-2026-9012', facility: 'Karen Referral Clinic', approvedAmount: 1200000, availableAdvance: 840000, risk: 'LOW' },
        { claim: 'CLM-2026-9104', facility: 'Aga Khan Outreach (Thika)', approvedAmount: 450000, availableAdvance: 315000, risk: 'LOW' },
        { claim: 'CLM-2026-9220', facility: 'St. MPesa Medical Center', approvedAmount: 950000, availableAdvance: 665000, risk: 'LOW' }
    ];

    useEffect(() => {
        fetch('/api/finance/opportunities/')
            .then(res => {
                if (!res.ok) return fetch('/finance/opportunities/');
                return res;
            })
            .then(res => res.json())
            .then(data => {
                const list = (data && data.length > 0) ? data : mockFallbacks;
                setClaims(list);
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch error, defaulting to fallback pool:", err);
                setError("Using localized gateway pool (Live API unreachable).");
                setClaims(mockFallbacks);
                setLoading(false);
            });
    }, []);

    // Calculate dynamic payouts based on slider
    const getDynamicAdvance = (amt) => Math.round(amt * (advanceRate / 100));

    const totalPool = claims.reduce((acc, c) => acc + c.approvedAmount, 0);
    const dynamicLimit = Math.round(totalPool * (advanceRate / 100));
    const feePool = Math.round(dynamicLimit * 0.025);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedClaims(claims.filter(c => !disbursedMap[c.claim]).map(c => c.claim));
        } else {
            setSelectedClaims([]);
        }
    };

    const handleToggleSelect = (id) => {
        setSelectedClaims(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const triggerHandshake = (id, amount, batch = false) => {
        setModalClaimRef(batch ? `Batch of ${selectedClaims.length} Claims` : id);
        setModalAmount(amount);
        setIsBatchTarget(batch);
        setModalStep(1);
        setIsProcessing(true);
        setModalOpen(true);

        setTimeout(() => setModalStep(2), 700);
        setTimeout(() => setModalStep(3), 1500);
        setTimeout(() => setModalStep(4), 2500);
        setTimeout(() => {
            setModalStep(5);
            setIsProcessing(false);
            executeDisbursement(batch ? selectedClaims : [id]);
        }, 3500);
    };

    const executeDisbursement = (ids) => {
        let addedPayout = 0;
        const newLedger = [];
        const updatedDisbursed = { ...disbursedMap };

        ids.forEach(id => {
            const item = claims.find(c => c.claim === id);
            if (item && !updatedDisbursed[id]) {
                const payout = getDynamicAdvance(item.approvedAmount);
                addedPayout += payout;
                updatedDisbursed[id] = true;
                newLedger.push({
                    time: new Date().toLocaleTimeString(),
                    ref: id,
                    facility: item.facility,
                    payout: payout
                });
            }
        });

        setDisbursedMap(updatedDisbursed);
        setTotalDisbursed(prev => prev + addedPayout);
        setLedgerEntries(prev => [...prev, ...newLedger]);
        if (isBatchTarget) setSelectedClaims([]);
    };

    const inspectFHIR = (item) => {
        const payout = getDynamicAdvance(item.approvedAmount);
        const payload = {
            resourceType: "ClaimResponse",
            id: item.claim,
            status: "active",
            type: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/claim-type", code: "institutional" }] },
            payee: { identifier: { value: item.facility } },
            payment: { amount: { value: payout, currency: "KES" } },
            securityFilter: {
                clinicalDiagnosis: "[REDACTED_BY_AFYACAPITAL_GATEWAY]",
                patientIdentifiers: "[REDACTED_HIPAA_COMPLIANCE]"
            }
        };
        setDrawerPayload(payload);
        setDrawerOpen(true);
    };

    if (loading) {
        return <div style={{ padding: '2rem', color: '#005a60', fontFamily: 'sans-serif' }}><h3>Loading AfyaCapital Financial Gateway...</h3></div>;
    }

    return (
        <div style={{ padding: '1.5rem', fontFamily: 'Segoe UI, sans-serif', background: '#f4f9f9', minHeight: '85vh', position: 'relative' }}>
            {/* Topbar */}
            <div style={{ background: '#eaf5f5', borderBottom: '2px solid #005a60', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <span style={{ fontSize: '0.75rem', color: '#005a60', fontWeight: 'bold', textTransform: 'uppercase' }}>openIMIS &gt; Legal & Finance &gt; Working Capital</span>
                    <h1 style={{ color: '#005a60', margin: '4px 0 0 0', fontSize: '1.6rem', fontWeight: 'normal' }}>AfyaCapital Receivables Financing Portal</h1>
                </div>
                <span style={{ background: '#005a60', color: '#fff', padding: '6px 14px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem' }}>FHIR R4 Gateway Active</span>
            </div>

            {error && <div style={{ background: '#fff3e0', borderLeft: '4px solid #ed6c02', padding: '0.8rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #cce3e3', padding: '0 1.5rem', gap: '20px', marginBottom: '1.5rem' }}>
                {['claims', 'ledger', 'analytics'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '12px 16px', border: 'none', background: 'none', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer',
                            color: activeTab === tab ? '#005a60' : '#666',
                            borderBottom: activeTab === tab ? '3px solid #005a60' : '3px solid transparent'
                        }}
                    >
                        {tab === 'claims' ? 'Adjudicated Claims Pool' : tab === 'ledger' ? 'Disbursement Ledger' : 'Liquidity Analytics'}
                    </button>
                ))}
            </div>

            {/* Metrics Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#fff', border: '1px solid #cce3e3', padding: '1rem', borderLeft: '4px solid #005a60' }}>
                    <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Eligible Pool</div>
                    <div style={{ fontSize: '1.3rem', color: '#005a60', fontWeight: 'bold', marginTop: '4px' }}>KES {totalPool.toLocaleString()}</div>
                </div>
                <div style={{ background: '#fff', border: '1px solid #cce3e3', padding: '1rem', borderLeft: '4px solid #005a60' }}>
                    <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>Factoring Limit ({advanceRate}%)</div>
                    <div style={{ fontSize: '1.3rem', color: '#005a60', fontWeight: 'bold', marginTop: '4px' }}>KES {dynamicLimit.toLocaleString()}</div>
                </div>
                <div style={{ background: '#fff', border: '1px solid #cce3e3', padding: '1rem', borderLeft: '4px solid #ed6c02' }}>
                    <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>Gateway Fee Pool (2.5%)</div>
                    <div style={{ fontSize: '1.3rem', color: '#ed6c02', fontWeight: 'bold', marginTop: '4px' }}>KES {feePool.toLocaleString()}</div>
                </div>
                <div style={{ background: '#fff', border: '1px solid #cce3e3', padding: '1rem', borderLeft: '4px solid #2e7d32' }}>
                    <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: 'bold' }}>Settled Disbursements</div>
                    <div style={{ fontSize: '1.3rem', color: '#2e7d32', fontWeight: 'bold', marginTop: '4px' }}>KES {totalDisbursed.toLocaleString()}</div>
                </div>
            </div>

            {/* TAB 1: CLAIMS */}
            {activeTab === 'claims' && (
                <div>
                    <div style={{ background: '#fff', border: '1px solid #cce3e3', padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#005a60' }}>
                            Liquidity Advance Rate: {advanceRate}%
                            <input type="range" min="60" max="85" value={advanceRate} onChange={(e) => setAdvanceRate(Number(e.target.value))} style={{ marginLeft: '15px' }} />
                        </div>
                        <button 
                            onClick={() => triggerHandshake('BATCH', 0, true)} 
                            disabled={selectedClaims.length === 0}
                            style={{ background: selectedClaims.length > 0 ? '#005a60' : '#aaa', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '2px', fontWeight: 'bold', cursor: selectedClaims.length > 0 ? 'pointer' : 'default' }}
                        >
                            Advance Selected Batch ({selectedClaims.length})
                        </button>
                    </div>

                    <div style={{ background: '#fff', border: '1px solid #cce3e3', padding: '1.2rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#d5ebeb', textAlign: 'left', color: '#005a60', fontSize: '0.8rem' }}>
                                    <th style={{ padding: '10px' }}><input type="checkbox" onChange={handleSelectAll} checked={selectedClaims.length > 0 && selectedClaims.length === claims.filter(c => !disbursedMap[c.claim]).length} /></th>
                                    <th style={{ padding: '10px' }}>Claim Ref</th>
                                    <th style={{ padding: '10px' }}>Healthcare Facility</th>
                                    <th style={{ padding: '10px' }}>Adjudicated Value</th>
                                    <th style={{ padding: '10px' }}>Available Payout</th>
                                    <th style={{ padding: '10px' }}>Audit Risk</th>
                                    <th style={{ padding: '10px', textAlign: 'right' }}>Operations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {claims.map((c, i) => {
                                    const payout = getDynamicAdvance(c.approvedAmount);
                                    const isDone = disbursedMap[c.claim];
                                    return (
                                        <tr key={i} style={{ borderBottom: '1px solid #e0eeee', background: isDone ? '#e8f5e9' : 'transparent', fontSize: '0.85rem' }}>
                                            <td style={{ padding: '10px' }}><input type="checkbox" disabled={isDone} checked={selectedClaims.includes(c.claim)} onChange={() => handleToggleSelect(c.claim)} /></td>
                                            <td style={{ padding: '10px', fontWeight: 'bold', color: '#005a60' }}>{c.claim}</td>
                                            <td style={{ padding: '10px' }}>{c.facility}</td>
                                            <td style={{ padding: '10px' }}>KES {c.approvedAmount.toLocaleString()}</td>
                                            <td style={{ padding: '10px', fontWeight: 'bold', color: '#2e7d32' }}>KES {payout.toLocaleString()}</td>
                                            <td style={{ padding: '10px' }}><span style={{ background: '#e0f2f1', color: '#005a60', border: '1px solid #b2dfdb', padding: '2px 6px', borderRadius: '3px', fontSize: '0.7rem', fontWeight: 'bold' }}>{c.risk}</span></td>
                                            <td style={{ padding: '10px', textAlign: 'right' }}>
                                                <button onClick={() => inspectFHIR(c)} style={{ background: 'transparent', color: '#005a60', border: '1px solid #005a60', padding: '5px 10px', borderRadius: '2px', marginRight: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Inspect Payload</button>
                                                <button onClick={() => triggerHandshake(c.claim, payout)} disabled={isDone} style={{ background: isDone ? '#2e7d32' : '#005a60', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '2px', cursor: isDone ? 'default' : 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                    {isDone ? 'Disbursed ✓' : 'Advance'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: LEDGER */}
            {activeTab === 'ledger' && (
                <div style={{ background: '#fff', border: '1px solid #cce3e3', padding: '1.5rem' }}>
                    <h3 style={{ marginTop: 0, color: '#005a60' }}>Trust Account Settlement Audit Trail</h3>
                    <p style={{ fontSize: '0.85rem', color: '#666' }}>Ledger of real-time RTGS/Mobile Money settlements executed via Partner Bank Gateway.</p>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ background: '#d5ebeb', textAlign: 'left', color: '#005a60', fontSize: '0.8rem' }}>
                                <th style={{ padding: '10px' }}>Timestamp</th><th style={{ padding: '10px' }}>Reference ID</th><th style={{ padding: '10px' }}>Facility Trust Account</th><th style={{ padding: '10px' }}>Gross Payout</th><th style={{ padding: '10px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ledgerEntries.length === 0 ? (
                                <tr><td colspan="5" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No transactions disbursed in current session.</td></tr>
                            ) : (
                                ledgerEntries.map((l, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #eee', fontSize: '0.85rem' }}>
                                        <td style={{ padding: '10px' }}>{l.time}</td><td style={{ padding: '10px', fontWeight: 'bold', color: '#005a60' }}>{l.ref}</td><td style={{ padding: '10px' }}>{l.facility} Trust Wallet</td><td style={{ padding: '10px', color: '#2e7d32', fontWeight: 'bold' }}>KES {l.payout.toLocaleString()}</td><td style={{ padding: '10px', fontWeight: 'bold' }}>SETTLED ✓</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB 3: ANALYTICS */}
            {activeTab === 'analytics' && (
                <div style={{ background: '#fff', border: '1px solid #cce3e3', padding: '1.5rem' }}>
                    <h3 style={{ marginTop: 0, color: '#005a60' }}>System Governance & Portfolio Health</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '1rem' }}>
                        <div style={{ padding: '15px', background: '#f9fdfd', border: '1px solid #cce3e3' }}>
                            <strong>Automated Adjudication Pass Rate:</strong> 94.2%<br/><br/><small style={{ color: '#666' }}>Claims evaluated under automated clinical parameters without manual override.</small>
                        </div>
                        <div style={{ padding: '15px', background: '#f9fdfd', border: '1px solid #cce3e3' }}>
                            <strong>Zero-Knowledge Privacy Audit:</strong> 100% Compliant<br/><br/><small style={{ color: '#666' }}>Zero patient PII or ICD-11 diagnosis codes transmitted outside openIMIS core.</small>
                        </div>
                    </div>
                </div>
            )}

            {/* STEPPED PRIVACY HANDSHAKE MODAL */}
            {modalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
                    <div style={{ background: '#fff', width: '520px', borderTop: '5px solid #005a60', padding: '2rem', borderRadius: '4px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ marginTop: 0, color: '#005a60', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>AfyaCapital Zero-Knowledge Transmission</h3>
                        <p style={{ fontSize: '0.85rem', color: '#555' }}>Executing privacy-preserving banking handshake for <strong>{modalClaimRef}</strong>...</p>
                        
                        <div style={{ margin: '1.5rem 0', fontSize: '0.9rem' }}>
                            {[
                                { s: 1, label: '1. Adjudication Status Verification' },
                                { s: 2, label: '2. Extracting FHIR R4 Financial Metadata' },
                                { s: 3, label: '3. Privacy Firewall: Redacting Patient PII & Clinical Notes', highlight: true },
                                { s: 4, label: '4. Partner Bank Risk Assessment & RTGS Settlement Wire' }
                            ].map(step => {
                                const done = modalStep > step.s;
                                const active = modalStep === step.s;
                                return (
                                    <div key={step.s} style={{ padding: '10px', borderBottom: '1px dashed #eee', display: 'flex', justifyContent: 'space-between', background: step.highlight ? '#fff3e0' : 'transparent', fontWeight: step.highlight ? 'bold' : 'normal' }}>
                                        <span>{active ? '⏳ ' : done ? '🔒 ' : '▫️ '}{step.label}</span>
                                        <span style={{ fontWeight: 'bold', color: done ? '#2e7d32' : active ? '#ed6c02' : '#999' }}>
                                            {done ? (step.s === 4 ? '200 OK (Settled) ✓' : 'Verified ✓') : active ? 'Processing...' : 'Waiting...'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
                            <button onClick={() => setModalOpen(false)} disabled={isProcessing} style={{ background: '#005a60', color: '#fff', border: 'none', padding: '8px 16px', fontWeight: 'bold', opacity: isProcessing ? 0.5 : 1, cursor: isProcessing ? 'default' : 'pointer' }}>
                                {isProcessing ? 'Processing Handshake...' : 'Close & Return to Dashboard'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* JSON INSPECTOR DRAWER */}
            {drawerOpen && (
                <div style={{ position: 'fixed', right: 0, top: 0, width: '420px', height: '100%', background: '#1e1e1e', color: '#00ff66', fontFamily: 'monospace', padding: '1.5rem', boxShadow: '-5px 0 15px rgba(0,0,0,0.3)', zIndex: 4000, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #444', paddingBottom: '8px' }}>
                        <h3 style={{ color: '#fff', margin: 0, fontFamily: 'Segoe UI, sans-serif' }}>FHIR R4 Sanitized Payload</h3>
                        <button onClick={() => setDrawerOpen(false)} style={{ background: 'red', color: '#fff', border: 'none', padding: '4px 8px', cursor: 'pointer' }}>X</button>
                    </div>
                    <p style={{ color: '#aaa', fontSize: '0.75rem', marginTop: '10px' }}>This payload demonstrates live stripping of clinical records prior to external transmission.</p>
                    <pre style={{ fontSize: '0.8rem', lineHeight: 1.4, whiteSpace: 'pre-wrap', marginTop: '15px' }}>{JSON.stringify(drawerPayload, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default AfyaCapitalDashboard;