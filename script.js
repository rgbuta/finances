// ================= FIREBASE V28 - TRANSACTIONS LANG NEGATIVE, TOTALS PLAIN =================
const firebaseConfig = {
  apiKey: "AIzaSyCemGkC9X-qGXP85yfOHWAaA_U8I8svYu0",
  authDomain: "myprofile1124.firebaseapp.com",
  projectId: "myprofile1124",
  storageBucket: "myprofile1124.firebasestorage.app",
  messagingSenderId: "317629844028",
  appId: "1:317629844028:web:98eae3b815e89012e7d139",
  measurementId: "G-2KEP28KTLR"
};
let dbFirebase=null,firebaseDocRef=null,isFirebaseLoaded=false,isInitialSync=true;
let db={
  income:[],expense:[],bills:[],loans:[],savingsTx:[],walletTx:[],
  wallets:[{id:1,name:'Cash',type:'cash',icon:'💵',balance:0},{id:2,name:'GCash',type:'ewallet',icon:'📱',balance:0},{id:3,name:'BPI Bank',type:'bank',icon:'🏦',balance:0}],
  savings:{
    emergency:{name:'Emergency Fund',amount:0,goal:50000,icon:'🛡️',color:'#ec4899',custom:false},
    education:{name:'Education Fund',amount:0,goal:100000,icon:'🎓',color:'#8b7cf8',custom:false},
    savings:{name:'General Savings',amount:0,goal:200000,icon:'💖',color:'#f472b6',custom:false},
    travel:{name:'Travel Fund',amount:0,goal:50000,icon:'✈️',color:'#fb7185',custom:false},
    business:{name:'Business Fund',amount:0,goal:100000,icon:'💼',color:'#a78bfa',custom:false},
    house:{name:'House Fund',amount:0,goal:500000,icon:'🏠',color:'#fbbf24',custom:false}
  }
};
function getDefaultDb(){return JSON.parse(JSON.stringify(db));}
function initFirebase(){
  try{
    firebase.initializeApp(firebaseConfig);
    dbFirebase=firebase.firestore();
    firebaseDocRef=dbFirebase.collection('boss_christine_users').doc('main_user_2026_2036');
    document.getElementById('firebaseStatus').textContent="⏳ Connecting...";
    firebaseDocRef.get().then((doc)=>{
      if(doc.exists&&doc.data().db){
        db=doc.data().db;
        if(!db.income)db.income=[];if(!db.expense)db.expense=[];if(!db.bills)db.bills=[];if(!db.loans)db.loans=[];if(!db.savingsTx)db.savingsTx=[];if(!db.walletTx)db.walletTx=[];
        if(!db.wallets||db.wallets.length===0) db.wallets=getDefaultDb().wallets;
        if(!db.savings) db.savings=getDefaultDb().savings;
      }else{ db=getDefaultDb(); firebaseDocRef.set({db:db,updatedAt:firebase.firestore.FieldValue.serverTimestamp()}); }
      render(); isFirebaseLoaded=true; isInitialSync=false;
      document.getElementById('firebaseStatus').textContent="🔥 Connected ✅";
      document.getElementById('firebaseStatus').style.background="#d4edda"; document.getElementById('firebaseStatus').style.color="#155724";
    });
    firebaseDocRef.onSnapshot((doc)=>{ if(doc.exists&&doc.data().db&&isFirebaseLoaded){ db=doc.data().db; if(!db.wallets) db.wallets=getDefaultDb().wallets; if(!db.walletTx) db.walletTx=[]; render(); }});
  }catch(e){console.error(e);}
}
function saveToFirebase(){ if(!firebaseDocRef) return; if(isInitialSync&&!isFirebaseLoaded) return; firebaseDocRef.set({db:db,updatedAt:firebase.firestore.FieldValue.serverTimestamp()}).then(()=>{document.getElementById('firebaseStatus').textContent="💾 Saved ✅"; setTimeout(()=>{document.getElementById('firebaseStatus').textContent="🔥 Connected ✅"},2000);});}
function parseMoney(s){if(!s)return 0;return Number(String(s).replace(/,/g,'').replace(/[^0-9]/g,''))||0;}
function formatInput(el){var raw=el.value.replace(/[^0-9]/g,''); if(raw===''){el.value='';return;} el.value=Number(raw).toLocaleString('en-US');}
document.addEventListener('DOMContentLoaded', function(){
  ['incAmount','expAmount','billAmt','loanAmount','loanMonthly','saveAmt','customGoal','walletBalance','transferAmount','payLoanAmount'].forEach(function(id){ var e=document.getElementById(id); if(e) e.addEventListener('input',function(){formatInput(this);}); });
  if(document.getElementById('incDate')) document.getElementById('incDate').value=new Date().toISOString().slice(0,10);
  if(document.getElementById('expDate')) document.getElementById('expDate').value=new Date().toISOString().slice(0,10);
  if(document.getElementById('loanStart')) document.getElementById('loanStart').value=new Date().toISOString().slice(0,10);
  if(document.getElementById('yearFilter')) document.getElementById('yearFilter').value='all';
  if(document.getElementById('monthFilter')) document.getElementById('monthFilter').value='all';
  initFirebase();
  let termEl=document.getElementById('loanTerm'); let amountEl=document.getElementById('loanAmount');
  if(termEl&&amountEl){ let autoCompute=function(){let amt=parseMoney(amountEl.value); let term=parseInt(termEl.value)||0; if(amt&&term){let monthlyEl=document.getElementById('loanMonthly'); if(monthlyEl) monthlyEl.value=Math.ceil(amt/term).toLocaleString('en-US');}}; termEl.addEventListener('input',autoCompute); amountEl.addEventListener('input',autoCompute); }
  document.addEventListener('click', function(e){ if(e.target.classList.contains('modal')){ e.target.classList.remove('active'); } });
  let payBillWalletEl=document.getElementById('payBillWallet'); if(payBillWalletEl) payBillWalletEl.addEventListener('change', updatePayBillInfo);
  let payLoanWalletEl=document.getElementById('payLoanWallet'); if(payLoanWalletEl) payLoanWalletEl.addEventListener('change', updatePayLoanInfo);
  let payLoanAmtEl=document.getElementById('payLoanAmount'); if(payLoanAmtEl) payLoanAmtEl.addEventListener('input', updatePayLoanInfo);
});
let selectedYear='all',selectedMonth='all';
let currentPayBillId=null, currentPayLoanId=null;
function save(){if(!isFirebaseLoaded&&isInitialSync)return; saveToFirebase();}
function mk(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');}
function fmt(n){return '₱'+Number(n||0).toLocaleString('en-PH');}
function tab(id,el){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.navbtn').forEach(b=>b.classList.remove('active'));
  if(el) el.classList.add('active');
  else{ let map={dashboard:0,wallet:1,income:2,expense:3,bills:4,loans:5,savings:6}; let btns=document.querySelectorAll('.navbtn'); if(btns[map[id]]) btns[map[id]].classList.add('active'); }
}
function changeFilter(){selectedYear=document.getElementById('yearFilter').value; selectedMonth=document.getElementById('monthFilter').value; render();}
function resetFilter(){selectedYear='all'; selectedMonth='all'; document.getElementById('yearFilter').value='all'; document.getElementById('monthFilter').value='all'; render();}
function isFiltered(item){if(selectedYear==='all'&&selectedMonth==='all')return true;if(!item.date)return true;let y=item.date.slice(0,4);let m=item.date.slice(5,7);if(selectedYear!=='all'&&y!==selectedYear)return false;if(selectedMonth!=='all'&&m!==selectedMonth)return false;return true;}
function getFiltered(arr){return arr.filter(isFiltered);}
function getWalletTotal(){return db.wallets.reduce((s,w)=>s+w.balance,0);}
function getWalletById(id){return db.wallets.find(w=>w.id==id);}
function openModal(id){ document.getElementById(id).classList.add('active'); }
function closeModal(id){ document.getElementById(id).classList.remove('active'); }

// POP-UP - TOTALS PLAIN, TRANSACTIONS MAY NEGATIVE
function showIncomeBreakdown(){ let filtered=getFiltered(db.income); let total=filtered.reduce((s,x)=>s+x.amount,0); let txHtml=filtered.slice().reverse().slice(0,15).map(x=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #fce7f3"><div><b style="font-size:11px">${x.note}</b><div style="font-size:10px;color:#b07a94">${x.source} • 👛 ${x.walletName} • ${x.date}</div></div><b style="color:#22c55e">+${fmt(x.amount)}</b></div>`).join('')||'No income'; let html=`<div style="background:linear-gradient(135deg,#fff0f6,#fdf4ff);padding:16px;border-radius:16px;border:1.5px solid #f9a8d4;margin-bottom:12px;text-align:center"><div style="font-size:24px">💵</div><b style="color:#ec4899">INCOME BREAKDOWN</b><h2 style="color:#ec4899;margin:8px 0">${fmt(total)}</h2><small>Plain total • Transactions with + sign</small></div><h3 style="font-size:13px">📜 History</h3><div class="list" style="max-height:350px;overflow-y:auto">${txHtml}</div>`; document.getElementById('breakdownTitle').textContent='💵 Income'; document.getElementById('breakdownContent').innerHTML=html; openModal('breakdownModal'); }
function showExpenseBreakdown(){ let filtered=getFiltered(db.expense).filter(x=>x.category!=='Savings'); let total=filtered.reduce((s,x)=>s+x.amount,0); let txHtml=filtered.slice().reverse().slice(0,15).map(x=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #fce7f3"><div><b style="font-size:11px">${x.note}</b><div style="font-size:10px;color:#b07a94">${x.category} • 👛 ${x.walletName} • ${x.date}</div></div><b style="color:#ef4444">-${fmt(x.amount)}</b></div>`).join('')||'No expense'; let html=`<div style="background:linear-gradient(135deg,#fff1f2,#fff0f6);padding:16px;border-radius:16px;border:1.5px solid #fecdd3;margin-bottom:12px;text-align:center"><div style="font-size:24px">💸</div><b style="color:#ff6b8a">EXPENSE BREAKDOWN</b><h2 style="color:#ff6b8a;margin:8px 0">${fmt(total)}</h2><small>Plain total • Transactions with - sign</small></div><h3 style="font-size:13px">📜 Transaction History</h3><div class="list" style="max-height:350px;overflow-y:auto">${txHtml}</div>`; document.getElementById('breakdownTitle').textContent='💸 Expense'; document.getElementById('breakdownContent').innerHTML=html; openModal('breakdownModal'); }
function showSavingsBreakdown(){ let total=0; for(var k in db.savings){ total+=db.savings[k].amount; } let fundsHtml=Object.keys(db.savings).map(k=>{ let v=db.savings[k]; return `<div onclick="closeModal('breakdownModal'); showFundBreakdown('${k}')" style="cursor:pointer;display:flex;justify-content:space-between;padding:8px 10px;background:#fff0f6;border-radius:10px;margin-bottom:6px;border-left:3px solid ${v.color}"><div><b style="font-size:11px">${v.icon} ${v.name}</b></div><b style="color:${v.color}">${fmt(v.amount)}</b></div>`; }).join(''); let html=`<div style="background:linear-gradient(135deg,#fff0f6,#f3e8ff);padding:16px;border-radius:16px;border:1.5px solid #f9a8d4;margin-bottom:12px;text-align:center"><div style="font-size:24px">💎</div><b style="color:#ec4899">SAVINGS</b><h2 style="color:#ec4899;margin:8px 0">${fmt(total)}</h2><small>Plain total figure only</small><div style="margin-top:12px;text-align:left">${fundsHtml}</div></div>`; document.getElementById('breakdownTitle').textContent='💎 Savings'; document.getElementById('breakdownContent').innerHTML=html; openModal('breakdownModal'); }
function showWalletBreakdown(){ let total=getWalletTotal(); let walletHtml=db.wallets.map(w=>{ let pct=total?Math.round(w.balance/total*100):0; let txCount=(db.walletTx||[]).filter(t=>t.from===w.name||t.to===w.name).length; return `<div onclick="showWalletSpecific(${w.id})" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:10px;background:${w.type==='cash'?'#f0fdf4':w.type==='bank'?'#eff6ff':'#faf5ff'};border-radius:10px;margin-bottom:6px;border:1px solid #fce7f3"><div><b style="font-size:11px">${w.icon} ${w.name}</b><div style="font-size:10px;color:#b07a94">${pct}% • ${txCount} tx</div></div><b style="color:#be185d">${fmt(w.balance)}</b></div>`; }).join(''); let html=`<div style="background:linear-gradient(135deg,#fff0f6,#f3e8ff);padding:16px;border-radius:16px;border:1.5px solid #f9a8d4;margin-bottom:12px;text-align:center"><div style="font-size:24px">👛</div><b style="color:#be185d">WALLET BREAKDOWN</b><h2 style="color:#be185d;margin:8px 0">${fmt(total)}</h2><small>Plain total figure only</small><div style="margin-top:12px;text-align:left">${walletHtml}</div></div>`; document.getElementById('breakdownTitle').textContent='👛 Wallets'; document.getElementById('breakdownContent').innerHTML=html; openModal('breakdownModal'); }
function showWalletSpecific(id){
  let w=getWalletById(id); if(!w) return; let total=getWalletTotal(); let pct=total?Math.round(w.balance/total*100):0;
  let relatedTx=(db.walletTx||[]).filter(t=>t.from===w.name||t.to===w.name).slice().reverse();
  let txHtml=relatedTx.slice(0,30).map(t=>{ let isNegative=t.from===w.name; if(t.type==='income'||t.type==='add_wallet') isNegative=false; else if(t.type==='transfer') isNegative=t.from===w.name; let col=isNegative?'#ef4444':'#22c55e'; let sign=isNegative?'-':'+'; return `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px dashed #fce7f3"><div><b style="font-size:11px">${t.note}</b><div style="font-size:10px;color:#b07a94">${t.type.toUpperCase()} • ${t.from||''} ${t.from&&t.to?'→':''} ${t.to||''} • ${t.date} • ${isNegative?'OUT':'IN'}</div></div><b style="font-size:12px;color:${col}">${sign}${fmt(t.amount)}</b></div>`; }).join('')||'No transactions';
  let html=`<div style="background:linear-gradient(135deg,${w.type==='cash'?'#f0fdf4':w.type==='bank'?'#eff6ff':'#faf5ff'},#fff0f6);padding:16px;border-radius:16px;border:2px solid #f9a8d4;margin-bottom:12px;text-align:center"><div style="font-size:32px">${w.icon}</div><b style="color:#be185d;font-size:16px">${w.name}</b><div style="font-size:11px;color:#b07a94;text-transform:uppercase">${w.type} • ${pct}% of total</div><h2 style="color:#be185d;margin:8px 0">${fmt(w.balance)}</h2><small>Plain total - Wallet balance</small><div style="margin-top:10px;padding:8px;background:white;border-radius:10px;font-size:10px;color:#b07a94">💡 Plain total, but transactions with - / + signs</div></div><h3 style="font-size:13px;margin:12px 0">📜 ${w.name} - Transactions with - / +</h3><div class="list" style="max-height:400px;overflow-y:auto">${txHtml}</div>`;
  document.getElementById('breakdownTitle').textContent=w.icon+' '+w.name+''; document.getElementById('breakdownContent').innerHTML=html; openModal('breakdownModal');
}
function showBillsBreakdown(){ let total=db.bills.reduce((s,b)=>s+b.amount,0); let paid=db.bills.filter(b=>b.paidMonths.includes(mk(new Date()))).length; let billsHtml=db.bills.map(b=>{ let isPaid=b.paidMonths.includes(mk(new Date())); return `<div onclick="openPayBill(${b.id})" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:10px;background:${isPaid?'#f0fdf4':'#fff1f2'};border-radius:10px;margin-bottom:6px;border:1px solid #fce7f3"><div><b style="font-size:11px">${isPaid?'✅':'⏳'} ${b.name}</b><div style="font-size:10px;color:#b07a94">Due ${b.due}th • Paid ${b.paidMonths.length} times</div></div><b style="color:${isPaid?'#22c55e':'#f97316'}">${fmt(b.amount)}</b></div>`; }).join('')||'No bills'; let html=`<div style="background:linear-gradient(135deg,#fff7ed,#fff0f6);padding:16px;border-radius:16px;border:1.5px solid #fed7aa;margin-bottom:12px;text-align:center"><div style="font-size:24px">🧾</div><b style="color:#f97316">BILLS BREAKDOWN</b><h2 style="color:#f97316;margin:8px 0">${fmt(total)}/month</h2><small>Plain total figure only - Click bill to pay with wallet selector</small><div style="margin-top:12px;text-align:left">${billsHtml}</div></div>`; document.getElementById('breakdownTitle').textContent='🧾 Bills'; document.getElementById('breakdownContent').innerHTML=html; openModal('breakdownModal'); }
function showLoansBreakdown(){ let total=db.loans.reduce((s,l)=>s+l.amount,0); let paid=db.loans.reduce((s,l)=>s+(l.paid||0),0); let remaining=total-paid; let loansHtml=db.loans.map(l=>{ let pct=Math.min(100,Math.round((l.paid||0)/l.amount*100))||0; return `<div onclick="openPayLoan(${l.id})" style="cursor:pointer;padding:10px;background:#f5f3ff;border-radius:10px;margin-bottom:8px;border-left:3px solid #a78bfa"><div style="display:flex;justify-content:space-between"><b style="font-size:11px">${l.name}</b><small>${pct}%</small></div><div style="font-size:10px;color:#b07a94">Plain remaining ${fmt(l.amount-(l.paid||0))} • Click to pay</div><div class="bar" style="height:8px;margin-top:6px"><i style="width:${pct}%;background:linear-gradient(90deg,#8b5cf6,#ec4899)"></i></div></div>`; }).join('')||'No loans'; let html=`<div style="background:linear-gradient(135deg,#f5f3ff,#fff0f6);padding:16px;border-radius:16px;border:1.5px solid #ddd6fe;margin-bottom:12px;text-align:center"><div style="font-size:24px">🏦</div><b style="color:#a78bfa">LOANS BREAKDOWN</b><h2 style="color:#a78bfa;margin:8px 0">${fmt(remaining)} remaining</h2><small>Plain total figure only</small><div style="margin-top:12px;text-align:left">${loansHtml}</div></div>`; document.getElementById('breakdownTitle').textContent='🏦 Loans'; document.getElementById('breakdownContent').innerHTML=html; openModal('breakdownModal'); }
function showFundBreakdown(key){ let v=db.savings[key]; if(!v) return; let pct=Math.min(100,Math.round(v.amount/v.goal*100))||0; let tx=db.savingsTx.filter(t=>t.key===key).slice().reverse(); let txHtml=tx.slice(0,20).map(t=>{ let isNeg=t.type==='add'; return `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #fce7f3"><div><b style="font-size:11px">${isNeg?'-':'+'} ${fmt(t.amount)}</b><div style="font-size:10px;color:#b07a94">${t.note} • 👛 ${t.walletName||''} • ${t.date}</div></div><b style="color:${isNeg?'#ef4444':'#22c55e'}">${isNeg?'-':'+'}${fmt(t.amount)}</b></div>`; }).join('')||'No history'; let html=`<div style="background:linear-gradient(135deg,${v.color}15,#fff0f6);padding:16px;border-radius:16px;border:1.5px solid ${v.color}40;margin-bottom:12px;text-align:center"><div style="font-size:28px">${v.icon}</div><b style="color:${v.color}">${v.name}</b><h2 style="color:${v.color};margin:8px 0">${fmt(v.amount)}</h2><small>Plain total • Goal ${fmt(v.goal)} • ${pct}%</small><div class="bar" style="height:10px;margin-top:10px"><i style="width:${pct}%;background:linear-gradient(90deg,${v.color},#f9a8d4)"></i></div></div><h3 style="font-size:13px">📜 Transactions with - / + signs</h3><div class="list" style="max-height:350px;overflow-y:auto">${txHtml}</div>`; document.getElementById('breakdownTitle').textContent=v.icon+' '+v.name+', tx with signs'; document.getElementById('breakdownContent').innerHTML=html; openModal('breakdownModal'); }

function openPayBill(id){
  let b=db.bills.find(x=>x.id===id); if(!b) return;
  let m=mk(new Date()); let isPaid=b.paidMonths.includes(m);
  currentPayBillId=id;
  if(isPaid){
    if(!confirm(b.name+' is already paid this month ('+m+'). Refund/unpay?')) return;
    let lastExp=db.expense.find(x=>x.note===b.name&&x.month===m);
    let walletId=lastExp?lastExp.walletId:(b.walletId||db.wallets[0]?.id);
    let wallet=getWalletById(walletId)||db.wallets[0];
    wallet.balance+=b.amount;
    b.paidMonths=b.paidMonths.filter(x=>x!==m);
    db.expense=db.expense.filter(x=>!(x.category==='Bills'&&x.note===b.name&&x.month===m));
    db.walletTx=db.walletTx.filter(x=>!(x.type==='bill'&&x.note===b.name&&x.date.slice(0,7)===m));
    save(); closeModal('breakdownModal'); return;
  }
  let html=`<div style="background:linear-gradient(135deg,#fff7ed,#fff0f6);padding:14px;border-radius:14px;border:1.5px solid #fed7aa;margin-bottom:10px;text-align:center"><div style="font-size:28px">🧾</div><b style="color:#f97316">${b.name}</b><h3 style="color:#f97316;margin:6px 0">${fmt(b.amount)}</h3><small>Plain total figure</small></div>`;
  document.getElementById('payBillContent').innerHTML=html;
  document.getElementById('payBillTitle').textContent='🧾 Pay '+b.name;
  let opts=db.wallets.map(w=>`<option value="${w.id}" ${w.id==b.walletId?'selected':''}>${w.icon} ${w.name} - ${fmt(w.balance)} ${w.balance>=b.amount?'✅':'❌'}</option>`).join('');
  document.getElementById('payBillWallet').innerHTML=opts;
  updatePayBillInfo();
  document.getElementById('payBillBtn').onclick=function(){ confirmPayBill(); };
  openModal('payBillModal');
}
function updatePayBillInfo(){
  let bill=db.bills.find(x=>x.id===currentPayBillId); if(!bill) return;
  let walletId=document.getElementById('payBillWallet').value;
  let wallet=getWalletById(walletId);
  if(!wallet) return;
  let infoEl=document.getElementById('payBillInfo');
  if(wallet.balance>=bill.amount){
    infoEl.innerHTML=`✅ <b>${wallet.name}</b> has ${fmt(wallet.balance)} - Enough to pay ${fmt(bill.amount)}<br>After payment: ${fmt(wallet.balance-bill.amount)} remaining`;
    infoEl.style.background='#f0fdf4'; infoEl.style.border='1px solid #bbf7d0'; infoEl.style.color='#166534';
    document.getElementById('payBillBtn').disabled=false;
  }else{
    infoEl.innerHTML=`❌ <b>${wallet.name}</b> has only ${fmt(wallet.balance)} - Need ${fmt(bill.amount)}<br>Short: ${fmt(bill.amount-wallet.balance)}`;
    infoEl.style.background='#fef2f2'; infoEl.style.border='1px solid #fecdd3'; infoEl.style.color='#991b1b';
    document.getElementById('payBillBtn').disabled=true;
  }
}
function confirmPayBill(){
  let b=db.bills.find(x=>x.id===currentPayBillId); if(!b) return;
  let walletId=document.getElementById('payBillWallet').value;
  let wallet=getWalletById(walletId); if(!wallet) return alert('Select wallet!');
  if(b.amount>wallet.balance) return alert('❌ Insufficient! '+wallet.name+' has only '+fmt(wallet.balance));
  let m=mk(new Date());
  wallet.balance-=b.amount;
  b.paidMonths.push(m);
  b.walletId=walletId;
  db.expense.push({id:Date.now(),category:'Bills',walletId:wallet.id,walletName:wallet.name,amount:b.amount,date:new Date().toISOString().slice(0,10),note:b.name,month:m});
  db.walletTx.push({id:Date.now()+1,type:'bill',from:wallet.name,to:null,amount:b.amount,date:new Date().toISOString().slice(0,10),note:'Bill - '+b.name+' - Paid from '+wallet.name});
  save();
  closeModal('payBillModal'); closeModal('breakdownModal');
}
function openPayLoan(id){
  let l=db.loans.find(x=>x.id===id); if(!l) return;
  let remaining=l.amount-(l.paid||0);
  if(remaining<=0) return alert('🎉 Fully paid na boss!');
  currentPayLoanId=id;
  let html=`<div style="background:linear-gradient(135deg,#f5f3ff,#fff0f6);padding:14px;border-radius:14px;border:1.5px solid #ddd6fe;margin-bottom:10px;text-align:center"><div style="font-size:28px">🏦</div><b style="color:#6d28d9">${l.name}</b><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:10px 0;text-align:center"><div style="background:white;padding:8px;border-radius:10px"><small>Total</small><br><b>${fmt(l.amount)}</b></div><div style="background:white;padding:8px;border-radius:10px"><small>Paid</small><br><b style="color:#22c55e">${fmt(l.paid||0)}</b></div><div style="background:white;padding:8px;border-radius:10px"><small>Remaining</small><br><b style="color:#a78bfa">${fmt(remaining)}</b></div></div><small>Plain figures only</small></div>`;
  document.getElementById('payLoanContent').innerHTML=html;
  document.getElementById('payLoanTitle').textContent='🏦 Pay '+l.name;
  document.getElementById('payLoanAmount').value=l.monthly.toLocaleString('en-US');
  let opts=db.wallets.map(w=>`<option value="${w.id}" ${w.id==l.walletId?'selected':''}>${w.icon} ${w.name} - ${fmt(w.balance)}</option>`).join('');
  document.getElementById('payLoanWallet').innerHTML=opts;
  updatePayLoanInfo();
  document.getElementById('payLoanBtn').onclick=function(){ confirmPayLoan(false); };
  document.getElementById('payFullLoanBtn').onclick=function(){ confirmPayLoan(true); };
  openModal('payLoanModal');
}
function updatePayLoanInfo(){
  let l=db.loans.find(x=>x.id===currentPayLoanId); if(!l) return;
  let walletId=document.getElementById('payLoanWallet').value;
  let wallet=getWalletById(walletId);
  let amt=parseMoney(document.getElementById('payLoanAmount').value)||l.monthly;
  let remaining=l.amount-(l.paid||0);
  let infoEl=document.getElementById('payLoanInfo');
  if(!wallet){ infoEl.innerHTML='Select wallet'; return; }
  let afterPay=remaining-amt;
  if(wallet.balance>=amt){
    infoEl.innerHTML=`✅ <b>${wallet.name}</b> ${fmt(wallet.balance)} - Enough for ${fmt(amt)}<br>After pay: Wallet ${fmt(wallet.balance-amt)} • Loan remaining ${fmt(Math.max(0,afterPay))} - All plain figures`;
    infoEl.style.background='#f0fdf4'; infoEl.style.border='1px solid #bbf7d0'; infoEl.style.color='#166534';
  }else{
    infoEl.innerHTML=`❌ <b>${wallet.name}</b> has only ${fmt(wallet.balance)} - Need ${fmt(amt)}<br>Short: ${fmt(amt-wallet.balance)}`;
    infoEl.style.background='#fef2f2'; infoEl.style.border='1px solid #fecdd3'; infoEl.style.color='#991b1b';
  }
}
function confirmPayLoan(isFull){
  let l=db.loans.find(x=>x.id===currentPayLoanId); if(!l) return;
  let walletId=document.getElementById('payLoanWallet').value;
  let wallet=getWalletById(walletId); if(!wallet) return alert('Select wallet!');
  let remaining=l.amount-(l.paid||0);
  let amt=isFull?remaining:(parseMoney(document.getElementById('payLoanAmount').value)||l.monthly);
  if(amt>remaining) amt=remaining;
  if(!amt) return alert('Enter amount!');
  if(amt>wallet.balance) return alert('❌ Insufficient! '+wallet.name+' has only '+fmt(wallet.balance));
  wallet.balance-=amt;
  l.paid=(l.paid||0)+amt;
  l.walletId=walletId;
  l.payments.push({id:Date.now(),date:new Date().toISOString().slice(0,10),month:mk(new Date()),amount:amt,walletName:wallet.name});
  db.expense.push({id:Date.now(),category:'Loan Payment',walletId:wallet.id,walletName:wallet.name,amount:amt,date:new Date().toISOString().slice(0,10),note:l.name+(isFull?' Full':''),month:mk(new Date())});
  db.walletTx.push({id:Date.now()+1,type:'loan',from:wallet.name,to:null,amount:amt,date:new Date().toISOString().slice(0,10),note:'Loan Pay - '+l.name+' - From '+wallet.name});
  save();
  closeModal('payLoanModal'); closeModal('breakdownModal');
}

function addWallet(){ let name=document.getElementById('walletName').value.trim(); let type=document.getElementById('walletType').value; let icon=document.getElementById('walletIcon').value|| (type==='cash'?'💵':type==='bank'?'🏦':'📱'); let bal=parseMoney(document.getElementById('walletBalance').value)||0; if(!name) return alert('Name required!'); if(db.wallets.find(w=>w.name.toLowerCase()===name.toLowerCase())) return alert('Exists na!'); db.wallets.push({id:Date.now(),name:name,type:type,icon:icon,balance:bal}); if(bal>0){ db.walletTx.push({id:Date.now(),type:'add_wallet',from:null,to:name,amount:bal,date:new Date().toISOString().slice(0,10),note:'Initial '+name}); } save(); document.getElementById('walletName').value=''; document.getElementById('walletBalance').value=''; document.getElementById('walletIcon').value='';}
function deleteWallet(id){ let w=getWalletById(id); if(!w) return; if(w.balance>0) return alert('❌ May laman pa '+fmt(w.balance)); if(!confirm('Delete '+w.name+'?')) return; db.wallets=db.wallets.filter(x=>x.id!=id); save();}
function transferWallet(){ let fromId=document.getElementById('transferFrom').value; let toId=document.getElementById('transferTo').value; let amt=parseMoney(document.getElementById('transferAmount').value); if(!fromId||!toId) return alert('Select wallet!'); if(fromId==toId) return alert('Same wallet bawal!'); if(!amt) return alert('Amount required!'); let fromW=getWalletById(fromId); let toW=getWalletById(toId); if(amt>fromW.balance) return alert('❌ Insufficient!'); fromW.balance-=amt; toW.balance+=amt; db.walletTx.push({id:Date.now(),type:'transfer',from:fromW.name,to:toW.name,amount:amt,date:new Date().toISOString().slice(0,10),note:'Transfer '+fmt(amt)+' '+fromW.name+' → '+toW.name}); save(); document.getElementById('transferAmount').value='';}
function editWallet(id){ let w=getWalletById(id); let n=prompt('Edit name:', w.name); if(n) w.name=n; let ic=prompt('Edit icon:', w.icon); if(ic) w.icon=ic; save();}
function addIncome(){ let amt=parseMoney(document.getElementById('incAmount').value); if(!amt) return alert('Amount boss 💖'); let walletId=document.getElementById('incWallet').value; let wallet=getWalletById(walletId); if(!wallet) return alert('Select wallet!'); let dateVal=document.getElementById('incDate').value||new Date().toISOString().slice(0,10); wallet.balance+=amt; db.income.push({id:Date.now(),source:document.getElementById('incSource').value,walletId:walletId,walletName:wallet.name,amount:amt,date:dateVal,note:document.getElementById('incNote').value||document.getElementById('incSource').value,month:dateVal.slice(0,7)}); db.walletTx.push({id:Date.now()+1,type:'income',from:null,to:wallet.name,amount:amt,date:dateVal,note:document.getElementById('incSource').value+' - '+(document.getElementById('incNote').value||'')}); save(); document.getElementById('incAmount').value=''; document.getElementById('incNote').value='';}
function addExpense(){ let amt=parseMoney(document.getElementById('expAmount').value); if(!amt) return alert('Amount boss'); let walletId=document.getElementById('expWallet').value; let wallet=getWalletById(walletId); if(!wallet) return alert('Select wallet!'); if(amt>wallet.balance) return alert('❌ Insufficient!'); let dateVal=document.getElementById('expDate').value||new Date().toISOString().slice(0,10); wallet.balance-=amt; db.expense.push({id:Date.now(),category:document.getElementById('expCat').value,walletId:walletId,walletName:wallet.name,amount:amt,date:dateVal,note:document.getElementById('expNote').value||document.getElementById('expCat').value,month:dateVal.slice(0,7)}); db.walletTx.push({id:Date.now()+1,type:'expense',from:wallet.name,to:null,amount:amt,date:dateVal,note:document.getElementById('expCat').value+' - '+(document.getElementById('expNote').value||'')}); save(); document.getElementById('expAmount').value=''; document.getElementById('expNote').value='';}
function addBill(){ let name=document.getElementById('billName').value.trim(), amt=parseMoney(document.getElementById('billAmt').value); if(!name||!amt) return alert('Complete boss'); let walletId=document.getElementById('billWallet').value||''; db.bills.push({id:Date.now(),name:name,amount:amt,due:document.getElementById('billDue').value,walletId:walletId,paidMonths:[]}); save(); document.getElementById('billName').value=''; document.getElementById('billAmt').value='';}
function addLoan(){ let name=document.getElementById('loanName').value.trim(); let amount=parseMoney(document.getElementById('loanAmount').value); let term=parseInt(document.getElementById('loanTerm')?.value)||12; let monthly=parseMoney(document.getElementById('loanMonthly').value); let start=document.getElementById('loanStart')?.value||new Date().toISOString().slice(0,10); let walletId=document.getElementById('loanWallet')?.value||db.wallets[0]?.id; if(!name||!amount) return alert('Required'); if(!monthly) monthly=Math.ceil(amount/term); db.loans.push({id:Date.now(),name:name,amount:amount,term:term,monthly:monthly,paid:0,payments:[],startDate:start,walletId:walletId}); save(); document.getElementById('loanName').value=''; document.getElementById('loanAmount').value='';}
function addToSaving(){ let key=document.getElementById('saveType').value; let amt=parseMoney(document.getElementById('saveAmt').value); let walletId=document.getElementById('savingsWallet').value; let wallet=getWalletById(walletId); if(!wallet) return alert('Select wallet!'); if(!amt) return alert('Amount boss'); if(amt>wallet.balance) return alert('❌ Insufficient!'); let note=document.getElementById('saveNote').value||'Add to '+db.savings[key].name; wallet.balance-=amt; db.savings[key].amount+=amt; db.savingsTx.push({id:Date.now(),key:key,amount:amt,note:note,date:new Date().toISOString().slice(0,10),month:mk(new Date()),type:'add',walletName:wallet.name}); db.expense.push({id:Date.now()+1,category:'Savings',walletId:wallet.id,walletName:wallet.name,amount:amt,date:new Date().toISOString().slice(0,10),note:'💎 '+db.savings[key].name,month:mk(new Date())}); db.walletTx.push({id:Date.now()+2,type:'savings',from:wallet.name,to:db.savings[key].name,amount:amt,date:new Date().toISOString().slice(0,10),note:'Savings - '+db.savings[key].name}); save(); document.getElementById('saveAmt').value=''; document.getElementById('saveNote').value='';}
function createCustom(){ let name=document.getElementById('customName').value.trim(),goal=parseMoney(document.getElementById('customGoal').value)||100000,icon=document.getElementById('customIcon').value||'💖',color=document.getElementById('customColor').value; if(!name) return alert('Name required'); let key=name.toLowerCase().replace(/ /g,'_')+'_'+Date.now(); db.savings[key]={name:name,amount:0,goal:goal,icon:icon,color:color,custom:true}; save(); document.getElementById('customName').value=''; document.getElementById('customGoal').value='';}
function withdrawSaving(key){ let amt=parseMoney(prompt('Withdraw from '+db.savings[key].name+'? Max: '+fmt(db.savings[key].amount))); if(!amt||amt>db.savings[key].amount) return alert('Invalid'); let wallet=db.wallets[0]; db.savings[key].amount-=amt; wallet.balance+=amt; db.savingsTx.push({id:Date.now(),key:key,amount:amt,note:'Withdraw to '+wallet.name,date:new Date().toISOString().slice(0,10),month:mk(new Date()),type:'withdraw',walletName:wallet.name}); db.income.push({id:Date.now()+1,source:'Savings Withdraw',walletId:wallet.id,walletName:wallet.name,amount:amt,date:new Date().toISOString().slice(0,10),note:'Withdraw '+db.savings[key].name,month:mk(new Date())}); db.walletTx.push({id:Date.now()+2,type:'income',from:null,to:wallet.name,amount:amt,date:new Date().toISOString().slice(0,10),note:'Withdraw - '+db.savings[key].name}); save();}
function delIncome(id){ if(!confirm('Delete?')) return; let inc=db.income.find(x=>x.id===id); if(inc){let w=getWalletById(inc.walletId); if(w) w.balance-=inc.amount;} db.income=db.income.filter(x=>x.id!==id); save();}
function delExpense(id){ if(!confirm('Delete?')) return; let exp=db.expense.find(x=>x.id===id); if(exp&&exp.category!=='Savings'){let w=getWalletById(exp.walletId); if(w) w.balance+=exp.amount;} db.expense=db.expense.filter(x=>x.id!==id); save();}
function delBill(id){if(confirm('Delete bill?')){db.bills=db.bills.filter(x=>x.id!==id);save();}}
function delLoan(id){if(confirm('Delete loan?')){db.loans=db.loans.filter(x=>x.id!==id);save();}}
function delSavingsTx(id){ let tx=db.savingsTx.find(x=>x.id===id); if(!tx) return; if(confirm('Delete & reverse?')){ if(tx.type==='add'&&db.savings[tx.key]){db.savings[tx.key].amount-=tx.amount; let w=db.wallets.find(w=>w.name===tx.walletName)||db.wallets[0]; if(w) w.balance+=tx.amount;} else if(db.savings[tx.key]){db.savings[tx.key].amount+=tx.amount; let w=db.wallets.find(w=>w.name===tx.walletName)||db.wallets[0]; if(w) w.balance-=tx.amount;} db.savingsTx=db.savingsTx.filter(x=>x.id!==id); save();}}
function updateSaveSelect(){var sel=document.getElementById('saveType');if(!sel)return;var html='';for(var k in db.savings){var v=db.savings[k];html+='<option value="'+k+'">'+v.icon+' '+v.name+' - '+fmt(v.amount)+' / '+fmt(v.goal)+'</option>';}sel.innerHTML=html||'<option>No funds</option>';}
function logout(){if(confirm('Logout boss?')){sessionStorage.clear();localStorage.removeItem('boss_auth_persist');window.location.href="login.html";}}
function updateWalletSelects(){ let opts=db.wallets.map(w=>`<option value="${w.id}">${w.icon} ${w.name} - ${fmt(w.balance)}</option>`).join(''); ['incWallet','expWallet','billWallet','loanWallet','savingsWallet','transferFrom','transferTo','payBillWallet','payLoanWallet'].forEach(id=>{ let el=document.getElementById(id); if(el&&!id.includes('payBill')&&!id.includes('payLoan')) el.innerHTML=opts; });}

function render(){
  let m=mk(new Date());
  let filteredIncome=getFiltered(db.income);
  let filteredExpense=getFiltered(db.expense);
  let filteredSavingsTx=getFiltered(db.savingsTx);
  let savingsTotal=0;for(var k in db.savings){savingsTotal+=db.savings[k].amount;}
  let walletTotal=getWalletTotal();
  let displayInc=(selectedYear==='all'&&selectedMonth==='all')?db.income.reduce((s,x)=>s+x.amount,0):filteredIncome.reduce((s,x)=>s+x.amount,0);
  let expNoSavAll=db.expense.filter(x=>x.category!=='Savings').reduce((s,x)=>s+x.amount,0);
  let expNoSavFiltered=filteredExpense.filter(x=>x.category!=='Savings').reduce((s,x)=>s+x.amount,0);
  let displayExpNoSav=(selectedYear==='all'&&selectedMonth==='all')?expNoSavAll:expNoSavFiltered;
  let billsM=db.bills.reduce((s,b)=>s+b.amount,0);
  let loansRem=db.loans.reduce((s,l)=>s+((l.amount||0)-(l.paid||0)),0);
  // TOTALS PLAIN FIGURE ONLY - NO NEGATIVE
  document.getElementById('availableFund').textContent=fmt(walletTotal);
  if(document.getElementById('availableFund2')) document.getElementById('availableFund2').textContent=fmt(walletTotal);
  document.getElementById('totalIncome').textContent=fmt(displayInc);
  document.getElementById('totalExpense').textContent=fmt(displayExpNoSav);
  if(document.getElementById('totalSavings')) document.getElementById('totalSavings').textContent=fmt(savingsTotal);
  document.getElementById('totalBills').textContent=fmt(billsM);
  document.getElementById('totalLoans').textContent=fmt(loansRem);
  let monthNames=['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let filterText='';
  if(selectedYear==='all'&&selectedMonth==='all'){filterText='ALL TIME ✨';document.getElementById('filterLabel').textContent='ALL TIME';}
  else if(selectedYear!=='all'&&selectedMonth==='all'){filterText='Year '+selectedYear;document.getElementById('filterLabel').textContent='Year '+selectedYear;}
  else if(selectedYear==='all'&&selectedMonth!=='all'){filterText=monthNames[parseInt(selectedMonth)];document.getElementById('filterLabel').textContent=monthNames[parseInt(selectedMonth)];}
  else{filterText=monthNames[parseInt(selectedMonth)]+' '+selectedYear;document.getElementById('filterLabel').textContent=filterText;}
  document.getElementById('monthLabel').textContent='Showing: '+filterText;

  var dashHtml='';
  for(var k in db.savings){ var v=db.savings[k]; var pct=Math.min(100,Math.round(v.amount/v.goal*100))||0; dashHtml+='<div class="fund" onclick="showFundBreakdown(\''+k+'\')" style="cursor:pointer;border-left:4px solid '+v.color+'"><small>'+v.icon+' '+v.name.toUpperCase()+'</small><b>'+fmt(v.amount)+'</b><div class="bar"><i style="width:'+pct+'%;background:linear-gradient(90deg,'+v.color+',#f9a8d4)"></i></div><small>'+pct+'% • Plain</small></div>'; }
  document.getElementById('dashboardFunds').innerHTML=dashHtml||'<div class="fund"><small>No savings yet</small></div>';

  let grouped={cash:[],bank:[],ewallet:[]};
  db.wallets.forEach(w=>{if(!grouped[w.type]) grouped[w.type]=[]; grouped[w.type].push(w);});
  let walletHtml='';
  for(let type in grouped){
    if(grouped[type].length===0) continue;
    let label=type==='cash'?'💵 CASH':type==='bank'?'🏦 BANK':'📱 E-WALLET';
    let totalType=grouped[type].reduce((s,w)=>s+w.balance,0);
    walletHtml+=`<div class="card" style="border-left:4px solid ${type==='cash'?'#22c55e':type==='bank'?'#3b82f6':'#a855f7'}"><div style="display:flex;justify-content:space-between"><b>${label}</b><b style="color:#be185d">${fmt(totalType)}</b></div><div style="margin-top:10px;display:grid;gap:8px">`;
    grouped[type].forEach(w=>{
      let pct=walletTotal?Math.round(w.balance/walletTotal*100):0;
      let txCount=(db.walletTx||[]).filter(t=>t.from===w.name||t.to===w.name).length;
      walletHtml+=`<div onclick="showWalletSpecific(${w.id})" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:12px;background:${type==='cash'?'#f0fdf4':type==='bank'?'#eff6ff':'#faf5ff'};border-radius:12px;border:1.5px solid #fce7f3"><div><b style="font-size:12px">${w.icon} ${w.name}</b><div style="font-size:10px;color:var(--muted)">${pct}% • ${txCount} records • Plain balance</div></div><div style="text-align:right"><b style="font-size:12px;color:#be185d">${fmt(w.balance)}</b><div style="display:flex;gap:4px;margin-top:4px;justify-content:flex-end"><button class="btn-ghost" style="padding:4px 8px;font-size:9px" onclick="event.stopPropagation(); editWallet(${w.id})">✏️</button><button class="btn-del" style="padding:4px 8px;font-size:9px" onclick="event.stopPropagation(); deleteWallet(${w.id})">🗑️</button></div></div></div>`;
    });
    walletHtml+=`</div></div>`;
  }
  document.getElementById('walletList').innerHTML=walletHtml||'<div class="card">No wallets</div>';

  document.getElementById('walletBreakdownDash').innerHTML=db.wallets.map(w=>{ let pct=walletTotal?Math.round(w.balance/walletTotal*100):0; return `<div onclick="showWalletSpecific(${w.id})" style="cursor:pointer;display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #fce7f3"><span style="font-size:11px">${w.icon} ${w.name} <small style="color:#b07a94">(${pct}%)</small></span><b style="font-size:11px">${fmt(w.balance)}</b></div>`;}).join('')||'No wallets';

  // TRANSACTIONS LANG MAY NEGATIVE
  document.getElementById('incomeList').innerHTML=filteredIncome.slice().reverse().map(x=>`<div class="item"><div><b style="font-size:12px">${x.note}</b><div style="font-size:10px;color:var(--muted)">${x.source} • 👛 ${x.walletName||''} • ${x.date}</div></div><div style="display:flex;gap:6px;align-items:center"><b style="color:#22c55e;font-size:12px">+${fmt(x.amount)}</b><button class="btn-del" onclick="delIncome(${x.id})">🗑️</button></div></div>`).join('')||'<div style="text-align:center;color:var(--muted);padding:12px">No income</div>';
  document.getElementById('expenseList').innerHTML=filteredExpense.slice().reverse().map(x=>`<div class="item"><div><b style="font-size:12px">${x.note}</b><div style="font-size:10px;color:var(--muted)">${x.category} • 👛 ${x.walletName||''} • ${x.date}</div></div><div style="display:flex;gap:6px;align-items:center"><b style="color:#ef4444;font-size:12px">-${fmt(x.amount)}</b><button class="btn-del" onclick="delExpense(${x.id})">🗑️</button></div></div>`).join('')||'<div style="text-align:center;color:var(--muted);padding:12px">No expense</div>';

  document.getElementById('billsList').innerHTML=db.bills.map(b=>{
    var paid=b.paidMonths.includes(m);
    let wName=b.walletId? (getWalletById(b.walletId)?.name||'') : 'Default';
    return '<div class="item"><div><b style="font-size:12px">'+b.name+'</b><div style="font-size:10px;color:var(--muted)">Due '+b.due+'th • '+fmt(b.amount)+' plain total • Last wallet: '+(wName)+' • '+(b.paidMonths.length)+' paid</div></div><div style="display:flex;gap:6px"><button style="width:auto;padding:7px 14px;font-size:11px;background:'+(paid?'#fff0f6':'linear-gradient(135deg,#8b7cf8,#a78bfa)')+';color:'+(paid?'#be185d':'white')+';border-radius:99px" onclick="openPayBill('+b.id+')">'+(paid?'💖 Paid':'💳 Pay')+'</button><button class="btn-del" onclick="delBill('+b.id+')">🗑️</button></div></div>';
  }).join('')||'<div style="text-align:center;color:var(--muted);padding:12px">No bills</div>';

  var loansHtml=''; db.loans.forEach(l=>{ let pct=Math.min(100,Math.round((l.paid||0)/l.amount*100))||0;let remaining=l.amount-(l.paid||0); let wName=l.walletId? (getWalletById(l.walletId)?.name||'') : 'Default'; loansHtml+=`<div class="card" style="border-left:4px solid #a78bfa"><div style="display:flex;justify-content:space-between"><div><b style="color:#6d28d9">${l.name}</b><div style="font-size:11px;color:var(--muted)">Plain remaining ${fmt(remaining)} • Last wallet: ${wName} • ${ (l.payments||[]).length} payments</div></div><small style="background:#f3e8ff;color:#7c3aed;padding:4px 10px;border-radius:99px;font-weight:700">${pct}%</small></div><div class="bar" style="height:12px;margin:10px 0"><i style="width:${pct}%;background:linear-gradient(90deg,#8b5cf6,#ec4899)"></i></div><div style="display:flex;gap:8px;margin-top:12px"><button class="btn-purple" style="flex:2;padding:12px" onclick="openPayLoan(${l.id})" ${remaining<=0?'disabled':''}>${remaining<=0?'🎉 Paid':'💳 Pay'}</button><button class="btn-del" style="padding:12px" onclick="delLoan(${l.id})">🗑️</button></div></div>`; });
  document.getElementById('loansList').innerHTML=loansHtml||'<div class="card"><small>No loans</small></div>';
  var savingsHtml=''; for(var k in db.savings){ var v=db.savings[k]; var pct=Math.min(100,Math.round(v.amount/v.goal*100))||0; savingsHtml+='<div class="card" onclick="showFundBreakdown(\''+k+'\')" style="cursor:pointer;border-left:4px solid '+v.color+'"><div style="display:flex;justify-content:space-between"><div><span style="font-size:16px">'+v.icon+'</span> <b style="color:#be185d">'+v.name+'</b></div><small style="background:'+v.color+'22;color:'+v.color+';padding:4px 10px;border-radius:99px;font-weight:700">'+pct+'%</small></div><h2 style="margin:10px 0;color:'+v.color+'">'+fmt(v.amount)+'</h2><small>Goal: '+fmt(v.goal)+'</small><div class="bar" style="margin-top:10px;height:10px"><i style="width:'+pct+'%;background:linear-gradient(90deg,'+v.color+',#f9a8d4)"></i></div></div>'; }
  document.getElementById('savingsGrid').innerHTML=savingsHtml||'<div class="card"><small>No funds</small></div>';

  document.getElementById('walletTx').innerHTML=(db.walletTx||[]).slice().reverse().slice(0,30).map(t=>{
    let neg = t.from?true:false; if(t.type==='income'||t.type==='add_wallet') neg=false;
    let col=neg?'#ef4444':'#22c55e'; let sign=neg?'-':'+';
    let icon=t.type==='income'?'💵':t.type==='expense'?'💸':t.type==='transfer'?'🔄':t.type==='bill'?'🧾':t.type==='loan'?'🏦':t.type==='savings'?'💎':'💰';
    return `<div class="item"><div><b style="font-size:11px">${icon} ${t.note}</b><div style="font-size:10px;color:var(--muted)">${t.from||''} ${t.from&&t.to?'→':''} ${t.to||''} • ${t.date} • ${neg?'OUT':'IN'} • Transaction with sign</div></div><b style="font-size:11px;color:${col}">${sign}${fmt(t.amount)}</b></div>`;
  }).join('')||'<div style="text-align:center;color:var(--muted);padding:12px">No wallet tx</div>';

  if(document.getElementById('dashboardWalletTx')){
    document.getElementById('dashboardWalletTx').innerHTML=(db.walletTx||[]).slice().reverse().slice(0,10).map(t=>{
      let neg=t.from?true:false; if(t.type==='income'||t.type==='add_wallet') neg=false;
      let col=neg?'#ef4444':'#22c55e'; let sign=neg?'-':'+';
      return `<div class="item"><div><b style="font-size:11px">${t.note}</b><div style="font-size:10px;color:var(--muted)">${t.from||''} ${t.from&&t.to?'→':''} ${t.to||''} • ${t.date}</div></div><b style="color:${col}">${sign}${fmt(t.amount)}</b></div>`;
    }).join('')||'No tx';
  }
  var txHtml=''; filteredSavingsTx.slice().reverse().slice(0,30).forEach(t=>{var sv=db.savings[t.key];if(!sv)return;let isNeg=t.type==='add'; txHtml+='<div class="item"><div><b style="font-size:12px">'+sv.icon+' '+sv.name+'</b><div style="font-size:10px;color:var(--muted)">'+t.note+' • 👛 '+(t.walletName||'')+' • '+t.date+'</div></div><div style="display:flex;gap:6px;align-items:center"><b style="font-size:12px;color:'+(isNeg?'#ef4444':'#22c55e')+'">'+(isNeg?'-':'+')+fmt(t.amount)+'</b><button class="btn-del" onclick="delSavingsTx('+t.id+')">🗑️</button></div></div>';});
  document.getElementById('savingsTx').innerHTML=txHtml||'<div style="text-align:center;color:var(--muted);padding:12px">No savings tx</div>';
  document.getElementById('unpaidList').innerHTML=db.bills.filter(b=>!b.paidMonths.includes(m)).map(b=>'<div class="item" onclick="openPayBill('+b.id+')" style="cursor:pointer"><div><b>'+b.name+'</b><div style="font-size:10px;color:var(--muted)">Due '+b.due+'th • '+fmt(b.amount)+' plain • Click to pay</div></div><b style="color:#ef4444">${fmt(b.amount)}</b></div>').join('')||'<div style="text-align:center;color:#ec4899;padding:12px">All bills paid! 🎉</div>';
  document.getElementById('summaryList').innerHTML='Income: <b style="color:#22c55e">'+fmt(displayInc)+' plain</b> • Expense: <b style="color:#ff6b8a">'+fmt(displayExpNoSav)+' plain</b><br><div style="margin:8px 0;padding:10px;background:linear-gradient(135deg,#fff0f6,#f3e8ff);border-radius:12px;border:1px solid #f9a8d4"><b>💰 AVAILABLE</b><br><span style="font-size:20px;color:#be185d;font-weight:800">'+fmt(walletTotal)+'</span><br><small>Plain total figure only • '+db.wallets.map(w=>w.name+' '+fmt(w.balance)).join(' | ')+'</small><br><small style="color:#b07a94">💡 Transactions only with - / + signs</small></div>';
  updateSaveSelect(); updateWalletSelects();
}