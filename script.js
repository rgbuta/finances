// ================= FIREBASE CONFIG - PURE FIREBASE FILTERED AVAILABLE FUND =================
const firebaseConfig = {
  apiKey: "AIzaSyCemGkC9X-qGXP85yfOHWAaA_U8I8svYu0",
  authDomain: "myprofile1124.firebaseapp.com",
  projectId: "myprofile1124",
  storageBucket: "myprofile1124.firebasestorage.app",
  messagingSenderId: "317629844028",
  appId: "1:317629844028:web:98eae3b815e89012e7d139",
  measurementId: "G-2KEP28KTLR"
};
// ===========================================================================================

let dbFirebase = null;
let useFirebase = false;
let firebaseDocRef = null;

let db = {
  income: [],
  expense: [],
  bills: [],
  loans: [],
  savingsTx: [],
  savings: {
    emergency:{name:'Emergency Fund',amount:0,goal:50000,icon:'🛡️',color:'#ec4899',custom:false},
    education:{name:'Education Fund',amount:0,goal:100000,icon:'🎓',color:'#8b7cf8',custom:false},
    savings:{name:'General Savings',amount:0,goal:200000,icon:'💖',color:'#f472b6',custom:false},
    travel:{name:'Travel Fund',amount:0,goal:50000,icon:'✈️',color:'#fb7185',custom:false},
    business:{name:'Business Fund',amount:0,goal:100000,icon:'💼',color:'#a78bfa',custom:false},
    house:{name:'House Fund',amount:0,goal:500000,icon:'🏠',color:'#fbbf24',custom:false}
  }
};

function getDefaultDb() { return JSON.parse(JSON.stringify(db)); }

function initFirebase() {
  try {
    firebase.initializeApp(firebaseConfig);
    dbFirebase = firebase.firestore();
    useFirebase = true;
    firebaseDocRef = dbFirebase.collection('boss_christine_users').doc('main_user_2026_2036');
    document.getElementById('firebaseStatus').textContent = "🔥 Connecting to Database...";
    document.getElementById('firebaseStatus').style.background = "#d4edda";
    document.getElementById('firebaseStatus').style.color = "#155724";
    firebaseDocRef.onSnapshot((doc) => {
      if (doc.exists && doc.data().db) {
        db = doc.data().db;
        if(!db.income)db.income=[];if(!db.expense)db.expense=[];if(!db.bills)db.bills=[];if(!db.loans)db.loans=[];if(!db.savingsTx)db.savingsTx=[];
        if(!db.savings) db.savings = getDefaultDb().savings;
        db.loans = db.loans.map(l=>{
          if(l.total &&!l.amount){
            return {id:l.id, name:l.name, amount:l.total, term: l.term||Math.ceil(l.total/(l.monthly||1)), monthly:l.monthly||0, paid:l.paid||0, payments:l.payments||[], startDate:l.startDate||new Date().toISOString().slice(0,10)}
          }
          if(!l.payments) l.payments=[];
          if(l.paid==null) l.paid=0;
          if(!l.term) l.term=12;
          return l;
        });
        render();
        document.getElementById('firebaseStatus').textContent = "🔥 Connected to Database ✅";
      } else {
        db = getDefaultDb();
        saveToFirebase();
        render();
        document.getElementById('firebaseStatus').textContent = "🔥 New DB Created ✅";
      }
    }, (error) => {
      console.error(error);
      document.getElementById('firebaseStatus').textContent = "❌ Firebase Error: " + error.message;
      document.getElementById('firebaseStatus').style.background = "#f8d7da";
    });
  } catch (e) {
    console.error(e);
    document.getElementById('firebaseStatus').textContent = "❌ Init Error";
  }
}

function saveToFirebase() {
  if (!firebaseDocRef) return alert("Firebase not connected boss!");
  firebaseDocRef.set({
    db: db,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    document.getElementById('firebaseStatus').textContent = "🔥 Saved to Firebase ✅";
    setTimeout(()=>{document.getElementById('firebaseStatus').textContent="🔥 Connected to Database ✅"},2000);
  }).catch((err) => {
    document.getElementById('firebaseStatus').textContent = "❌ Save Failed: " + err.message;
    alert("Save failed: "+err.message);
  });
}

function parseMoney(s){ if(!s) return 0; return Number(String(s).replace(/,/g,'').replace(/[^0-9]/g,''))||0; }
function formatInput(el){ var raw=el.value.replace(/[^0-9]/g,''); if(raw===''){el.value='';return;} el.value=Number(raw).toLocaleString('en-US'); }

document.addEventListener('DOMContentLoaded', function(){
  ['incAmount','expAmount','billAmt','loanTotal','loanAmount','loanMonthly','loanPaid','saveAmt','customGoal'].forEach(function(id){
    var e=document.getElementById(id); if(e) e.addEventListener('input',function(){formatInput(this);});
  });
  if(document.getElementById('incDate')) document.getElementById('incDate').value=new Date().toISOString().slice(0,10);
  if(document.getElementById('expDate')) document.getElementById('expDate').value=new Date().toISOString().slice(0,10);
  if(document.getElementById('loanStart')) document.getElementById('loanStart').value=new Date().toISOString().slice(0,10);
  if(document.getElementById('yearFilter')) document.getElementById('yearFilter').value='all';
  if(document.getElementById('monthFilter')) document.getElementById('monthFilter').value='all';
  initFirebase();
  let termEl=document.getElementById('loanTerm');
  let amountEl=document.getElementById('loanAmount');
  if(termEl && amountEl){
    let autoCompute = function(){
      let amt=parseMoney(amountEl.value);
      let term=parseInt(termEl.value)||0;
      if(amt && term){
        let monthlyEl=document.getElementById('loanMonthly');
        if(monthlyEl) monthlyEl.value=Math.ceil(amt/term).toLocaleString('en-US');
      }
    };
    termEl.addEventListener('input',autoCompute);
    amountEl.addEventListener('input',autoCompute);
  }
});

let selectedYear='all';
let selectedMonth='all';
function save(){ saveToFirebase(); }
function mk(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');}
function fmt(n){return '₱'+Number(n||0).toLocaleString('en-PH');}
function tab(id,el){document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');document.querySelectorAll('.navbtn').forEach(b=>b.classList.remove('active'));el.classList.add('active');}
function changeFilter(){ selectedYear=document.getElementById('yearFilter').value; selectedMonth=document.getElementById('monthFilter').value; render(); }
function resetFilter(){ selectedYear='all'; selectedMonth='all'; document.getElementById('yearFilter').value='all'; document.getElementById('monthFilter').value='all'; render(); }
function isFiltered(item){ if(selectedYear==='all' && selectedMonth==='all') return true; if(!item.date) return true; let y=item.date.slice(0,4); let m=item.date.slice(5,7); if(selectedYear!=='all' && y!==selectedYear) return false; if(selectedMonth!=='all' && m!==selectedMonth) return false; return true; }
function getFiltered(arr){return arr.filter(isFiltered);}
function addIncome(){let amt=parseMoney(document.getElementById('incAmount').value);if(!amt)return alert('Amount boss 💖');let dateVal=document.getElementById('incDate').value||new Date().toISOString().slice(0,10);db.income.push({id:Date.now(),source:document.getElementById('incSource').value,amount:amt,date:dateVal,note:document.getElementById('incNote').value||document.getElementById('incSource').value,month:dateVal.slice(0,7)});save();}
function addExpense(){let amt=parseMoney(document.getElementById('expAmount').value);if(!amt)return alert('Amount boss');let dateVal=document.getElementById('expDate').value||new Date().toISOString().slice(0,10);db.expense.push({id:Date.now(),category:document.getElementById('expCat').value,amount:amt,date:dateVal,note:document.getElementById('expNote').value||document.getElementById('expCat').value,month:dateVal.slice(0,7)});save();}
function addBill(){let name=document.getElementById('billName').value.trim(),amt=parseMoney(document.getElementById('billAmt').value);if(!name||!amt)return alert('Complete boss');db.bills.push({id:Date.now(),name:name,amount:amt,due:document.getElementById('billDue').value,paidMonths:[]});save();}
function toggleBill(id){let b=db.bills.find(x=>x.id===id);let m=mk(new Date());if(b.paidMonths.includes(m)){b.paidMonths=b.paidMonths.filter(x=>x!==m);}else{b.paidMonths.push(m);db.expense.push({id:Date.now(),category:'Bills',amount:b.amount,date:new Date().toISOString().slice(0,10),note:b.name,month:m});}save();}
function addLoan(){
  let name=document.getElementById('loanName').value.trim();
  let amountEl=document.getElementById('loanAmount')||document.getElementById('loanTotal');
  let amount=parseMoney(amountEl.value);
  let term=parseInt(document.getElementById('loanTerm')?.value)||12;
  let monthly=parseMoney(document.getElementById('loanMonthly').value);
  let paidInit=parseMoney(document.getElementById('loanPaid')?.value);
  let start=document.getElementById('loanStart')?.value||new Date().toISOString().slice(0,10);
  if(!name||!amount)return alert('Loan Name and Amount required');
  if(!monthly) monthly=Math.ceil(amount/term);
  db.loans.push({id:Date.now(),name:name,amount:amount,term:term,monthly:monthly,paid:paidInit||0,payments:paidInit?[{id:Date.now(),date:start,month:start.slice(0,7),amount:paidInit}]:[],startDate:start});
  save();
}
function payLoan(id){let l=db.loans.find(x=>x.id===id);if(l.paid>=l.amount)return alert('Fully paid na!');let amt=parseMoney(prompt(`Pay for ${l.name}?\nMonthly: ${fmt(l.monthly)}\nRemaining: ${fmt(l.amount-l.paid)}`,l.monthly.toLocaleString()));if(!amt)return;if(l.paid+amt>l.amount)amt=l.amount-l.paid;l.paid+=amt;l.payments.push({id:Date.now(),date:new Date().toISOString().slice(0,10),month:mk(new Date()),amount:amt});db.expense.push({id:Date.now(),category:'Loan Payment',amount:amt,date:new Date().toISOString().slice(0,10),note:l.name+' - Monthly Payment',month:mk(new Date())});save();}
function payFullLoan(id){let l=db.loans.find(x=>x.id===id);let remaining=l.amount-l.paid;if(remaining<=0)return alert('Fully paid!');if(!confirm(`Pay full ${fmt(remaining)} for ${l.name}?`))return;l.paid=l.amount;l.payments.push({id:Date.now(),date:new Date().toISOString().slice(0,10),month:mk(new Date()),amount:remaining});db.expense.push({id:Date.now(),category:'Loan Payment',amount:remaining,date:new Date().toISOString().slice(0,10),note:l.name+' - Full Payment',month:mk(new Date())});save();}
function addToSaving(){let key=document.getElementById('saveType').value,amt=parseMoney(document.getElementById('saveAmt').value),note=document.getElementById('saveNote').value||'Add';if(!amt)return alert('Amount boss');db.savings[key].amount+=amt;db.savingsTx.push({id:Date.now(),key:key,amount:amt,note:note,date:new Date().toISOString().slice(0,10),month:mk(new Date()),type:'add'});save();}
function createCustom(){let name=document.getElementById('customName').value.trim(),goal=parseMoney(document.getElementById('customGoal').value)||100000,icon=document.getElementById('customIcon').value||'💖',color=document.getElementById('customColor').value;if(!name)return alert('Name required');let key=name.toLowerCase().replace(/ /g,'_')+'_'+Date.now();db.savings[key]={name:name,amount:0,goal:goal,icon:icon,color:color,custom:true};save();}
function withdrawSaving(key){let amt=parseMoney(prompt('Withdraw amount?'));if(!amt||amt>db.savings[key].amount)return alert('Invalid');db.savings[key].amount-=amt;db.savingsTx.push({id:Date.now(),key:key,amount:amt,note:'Withdraw',date:new Date().toISOString().slice(0,10),month:mk(new Date()),type:'withdraw'});save();}
function editSaving(key){let n=prompt('Edit name:',db.savings[key].name);if(n)db.savings[key].name=n;let g=parseMoney(prompt('Edit Goal:',db.savings[key].goal.toLocaleString()));if(g)db.savings[key].goal=g;save();}
function delSaving(key){if(confirm('Delete fund '+db.savings[key].name+'?')){delete db.savings[key];db.savingsTx=db.savingsTx.filter(t=>t.key!==key);save();}}
function delIncome(id){if(confirm('Delete income?')){db.income=db.income.filter(x=>x.id!==id);save();}}
function delExpense(id){if(confirm('Delete expense?')){db.expense=db.expense.filter(x=>x.id!==id);save();}}
function delBill(id){if(confirm('Delete bill?')){db.bills=db.bills.filter(x=>x.id!==id);save();}}
function delLoan(id){if(confirm('Delete loan?')){db.loans=db.loans.filter(x=>x.id!==id);save();}}
function delSavingsTx(id){let tx=db.savingsTx.find(x=>x.id===id);if(!tx)return;if(confirm('Delete & reverse '+fmt(tx.amount)+'?')){if(tx.type==='add'&&db.savings[tx.key])db.savings[tx.key].amount-=tx.amount;else if(db.savings[tx.key])db.savings[tx.key].amount+=tx.amount;db.savingsTx=db.savingsTx.filter(x=>x.id!==id);save();}}
function clearIncome(){if(confirm('Clear ALL income?')){db.income=[];save();}}
function clearExpense(){if(confirm('Clear ALL expense?')){db.expense=[];save();}}
function clearBills(){if(confirm('Delete ALL bills?')){db.bills=[];save();}}
function clearLoans(){if(confirm('Delete ALL loans?')){db.loans=[];save();}}
function clearSavingsTx(){if(confirm('Clear history?')){db.savingsTx=[];save();}}
function clearAllData(){if(confirm('DELETE ALL DATA in FIREBASE?')&&confirm('Sure ka boss?')){db=getDefaultDb();save();}}
function exportData(){var blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='boss-christine-pure-firebase.json';a.click();}
function updateSaveSelect(){var sel=document.getElementById('saveType');if(!sel)return;var html='';for(var k in db.savings){var v=db.savings[k];html+='<option value="'+k+'">'+v.icon+' '+v.name+' - '+fmt(v.amount)+' / Goal '+fmt(v.goal)+'</option>';}sel.innerHTML=html||'<option>No funds</option>';}

function render(){
  let m=mk(new Date());
  let filteredIncome=getFiltered(db.income);
  let filteredExpense=getFiltered(db.expense);
  let filteredSavingsTx=getFiltered(db.savingsTx);
  let incAll=db.income.reduce((s,x)=>s+x.amount,0);
  let expAll=db.expense.reduce((s,x)=>s+x.amount,0);
  let incFiltered=filteredIncome.reduce((s,x)=>s+x.amount,0);
  let expFiltered=filteredExpense.reduce((s,x)=>s+x.amount,0);
  let billsM=db.bills.reduce((s,b)=>s+b.amount,0);
  let loansRem=db.loans.reduce((s,l)=>s+((l.amount||l.total||0)-(l.paid||0)),0);
  let savingsTotal=0;for(var k in db.savings){savingsTotal+=db.savings[k].amount;}
  let availableAll = incAll - expAll;
  let displayInc=(selectedYear==='all'&&selectedMonth==='all')?incAll:incFiltered;
  let displayExp=(selectedYear==='all'&&selectedMonth==='all')?expAll:expFiltered;
  let availableFiltered = displayInc - displayExp;
  let topAvailable = (selectedYear==='all'&&selectedMonth==='all')? availableAll : availableFiltered;
  document.getElementById('availableFund').textContent=fmt(topAvailable);
  if(document.getElementById('netWorth')) document.getElementById('netWorth').textContent=fmt(topAvailable);
  document.getElementById('totalIncome').textContent=fmt(displayInc);
  document.getElementById('totalExpense').textContent=fmt(displayExp);
  document.getElementById('totalBills').textContent=fmt(billsM);
  document.getElementById('totalLoans').textContent=fmt(loansRem);
  let monthNames=['','January','February','March','April','May','June','July','August','September','October','November','December'];
  let filterText='';
  if(selectedYear==='all'&&selectedMonth==='all'){filterText='ALL TIME ✨';document.getElementById('filterLabel').textContent='ALL TIME';}
  else if(selectedYear!=='all'&&selectedMonth==='all'){filterText='Year '+selectedYear;document.getElementById('filterLabel').textContent='Year '+selectedYear;}
  else if(selectedYear==='all'&&selectedMonth!=='all'){filterText=monthNames[parseInt(selectedMonth)];document.getElementById('filterLabel').textContent=monthNames[parseInt(selectedMonth)];}
  else{filterText=monthNames[parseInt(selectedMonth)]+' '+selectedYear;document.getElementById('filterLabel').textContent=monthNames[parseInt(selectedMonth)]+' '+selectedYear;}
  document.getElementById('monthLabel').textContent='Showing: '+filterText;
  document.getElementById('totalIncomeMonth').textContent=(selectedYear==='all'&&selectedMonth==='all')?'All time total':'Filtered: '+filterText;
  document.getElementById('totalExpenseMonth').textContent=(selectedYear==='all'&&selectedMonth==='all')?'All time total':'Filtered: '+filterText;
  if(document.getElementById('incomeTitle')) document.getElementById('incomeTitle').textContent='Income History - '+filterText;
  if(document.getElementById('expenseTitle')) document.getElementById('expenseTitle').textContent='Expense History - '+filterText;
  var dashHtml='';
  for(var k in db.savings){
    var v=db.savings[k];
    var pct=Math.min(100,Math.round(v.amount/v.goal*100))||0;
    dashHtml+='<div class="fund" style="border-left:4px solid '+v.color+'"><small>'+v.icon+' '+v.name.toUpperCase()+'</small><b>'+fmt(v.amount)+'</b><div class="bar"><i style="width:'+pct+'%;background:linear-gradient(90deg,'+v.color+',#f9a8d4)"></i></div><small>'+pct+'% of '+fmt(v.goal)+'</small></div>';
  }
  document.getElementById('dashboardFunds').innerHTML=dashHtml||'<div class="fund"><small>No savings yet</small></div>';
  document.getElementById('incomeList').innerHTML=filteredIncome.slice().reverse().map(x=>'<div class="item"><div><b style="font-size:12px">'+x.note+'</b><div style="font-size:10px;color:var(--muted)">'+x.source+' • '+x.date+'</div></div><div style="display:flex;gap:6px;align-items:center"><b style="color:#ec4899;font-size:12px">'+fmt(x.amount)+'</b><button class="btn-del" onclick="delIncome('+x.id+')">🗑️</button></div></div>').join('')||'<div style="text-align:center;color:var(--muted);padding:12px">No income</div>';
  document.getElementById('expenseList').innerHTML=filteredExpense.slice().reverse().map(x=>'<div class="item"><div><b style="font-size:12px">'+x.note+'</b><div style="font-size:10px;color:var(--muted)">'+x.category+' • '+x.date+'</div></div><div style="display:flex;gap:6px;align-items:center"><b style="color:#ff6b8a;font-size:12px">'+fmt(x.amount)+'</b><button class="btn-del" onclick="delExpense('+x.id+')">🗑️</button></div></div>').join('')||'<div style="text-align:center;color:var(--muted);padding:12px">No expense</div>';
  document.getElementById('billsList').innerHTML=db.bills.map(b=>{var paid=b.paidMonths.includes(m);return '<div class="item"><div><b style="font-size:12px">'+b.name+'</b><div style="font-size:10px;color:var(--muted)">Due '+b.due+'th • '+fmt(b.amount)+'</div></div><div style="display:flex;gap:6px"><button style="width:auto;padding:7px 14px;font-size:11px;background:'+(paid?'#fff0f6':'linear-gradient(135deg,#8b7cf8,#a78bfa)')+';color:'+(paid?'#be185d':'white')+';border-radius:99px" onclick="toggleBill('+b.id+')">'+(paid?'💖 Paid':'Pay')+'</button><button class="btn-del" onclick="delBill('+b.id+')">🗑️</button></div></div>';}).join('')||'<div style="text-align:center;color:var(--muted);padding:12px">No bills</div>';
  var loansHtml='';
  db.loans.forEach(l=>{
    let amt=l.amount||l.total||0;let paid=l.paid||0;let pct=Math.min(100,Math.round(paid/amt*100))||0;let remaining=amt-paid;let term=l.term||12;let paidMonths=Math.floor(paid/(l.monthly||1));
    let paymentsHtml=(l.payments||[]).slice(-3).reverse().map(p=>'<div style="font-size:10px;color:var(--muted)">✅ '+p.date+' - '+fmt(p.amount)+'</div>').join('');
    loansHtml+=`<div class="card" style="border-left:4px solid #a78bfa"><div style="display:flex;justify-content:space-between"><div><b style="color:#6d28d9">${l.name}</b><div style="font-size:11px;color:var(--muted)">Start: ${l.startDate} • Term: ${term}mo • ${paidMonths}/${term} paid</div></div><small style="background:#f3e8ff;color:#7c3aed;padding:4px 10px;border-radius:99px;font-weight:700">${pct}%</small></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:12px 0;text-align:center"><div style="background:#fdf4ff;padding:8px;border-radius:12px"><small style="font-size:9px">LOAN AMOUNT</small><br><b style="color:#be185d;font-size:12px">${fmt(amt)}</b></div><div style="background:#f5f3ff;padding:8px;border-radius:12px"><small style="font-size:9px">MONTHLY</small><br><b style="color:#7c3aed;font-size:12px">${fmt(l.monthly)}</b></div><div style="background:#fff1f2;padding:8px;border-radius:12px"><small style="font-size:9px">REMAINING</small><br><b style="color:#e11d48;font-size:12px">${fmt(remaining)}</b></div></div><div class="bar" style="height:12px"><i style="width:${pct}%;background:linear-gradient(90deg,#8b5cf6,#ec4899)"></i></div>${paymentsHtml?'<div style="margin-top:8px;padding:8px;background:#faf5ff;border-radius:8px"><small style="font-weight:700">Recent Payments:</small>'+paymentsHtml+'</div>':''}<div style="display:flex;gap:8px;margin-top:12px"><button class="btn-purple" style="flex:2;padding:12px" onclick="payLoan(${l.id})" ${remaining<=0?'disabled':''}>${remaining<=0?'🎉 Fully Paid':'💳 Pay '+fmt(l.monthly)}</button>${remaining>0?`<button class="btn-ghost" style="flex:1;padding:12px" onclick="payFullLoan(${l.id})">Pay Full</button>`:''}<button class="btn-del" style="padding:12px" onclick="delLoan(${l.id})">🗑️</button></div></div>`;
  });
  document.getElementById('loansList').innerHTML=loansHtml||'<div class="card"><small>No loans yet</small></div>';
  var savingsHtml='';
  for(var k in db.savings){
    var v=db.savings[k];
    var pct=Math.min(100,Math.round(v.amount/v.goal*100))||0;
    savingsHtml+='<div class="card" style="border-left:4px solid '+v.color+'"><div style="display:flex;justify-content:space-between"><div><span style="font-size:16px">'+v.icon+'</span> <b style="color:#be185d">'+v.name+'</b></div><small style="background:'+v.color+'22;color:'+v.color+';padding:4px 10px;border-radius:99px;font-weight:700">'+pct+'%</small></div><h2 style="margin:10px 0;color:'+v.color+'">'+fmt(v.amount)+'</h2><small style="color:var(--muted)">Goal: '+fmt(v.goal)+' • Remaining: '+fmt(Math.max(0,v.goal-v.amount))+'</small><div class="bar" style="margin-top:10px;height:10px"><i style="width:'+pct+'%;background:linear-gradient(90deg,'+v.color+',#f9a8d4)"></i></div><div style="display:flex;gap:8px;margin-top:14px"><button class="btn-ghost" style="padding:10px;flex:1" onclick="withdrawSaving(\''+k+'\')">Withdraw</button><button class="btn-edit" style="padding:10px;flex:1" onclick="editSaving(\''+k+'\')">✏️ Edit</button><button class="btn-del" style="padding:10px;flex:1" onclick="delSaving(\''+k+'\')">🗑️</button></div></div>';
  }
  document.getElementById('savingsGrid').innerHTML=savingsHtml||'<div class="card"><small>No savings funds yet</small></div>';
  var txHtml='';
  filteredSavingsTx.slice().reverse().slice(0,30).forEach(t=>{var sv=db.savings[t.key];if(!sv)return;txHtml+='<div class="item"><div><b style="font-size:12px">'+sv.icon+' '+sv.name+'</b><div style="font-size:10px;color:var(--muted)">'+t.note+' • '+t.date+'</div></div><div style="display:flex;gap:6px;align-items:center"><b style="font-size:12px;color:'+(t.type==='add'?'#ec4899':'#ff6b8a')+'">'+(t.type==='add'?'+':'-')+fmt(t.amount)+'</b><button class="btn-del" onclick="delSavingsTx('+t.id+')">🗑️</button></div></div>';});
  document.getElementById('savingsTx').innerHTML=txHtml||'<div style="text-align:center;color:var(--muted);padding:12px">No transactions</div>';
  document.getElementById('unpaidList').innerHTML=db.bills.filter(b=>!b.paidMonths.includes(m)).map(b=>'<div class="item"><div><b>'+b.name+'</b><div style="font-size:10px;color:var(--muted)">Due '+b.due+'th</div></div><b style="color:#f97316">'+fmt(b.amount)+'</b></div>').join('')||'<div style="text-align:center;color:#ec4899;padding:12px">All bills paid! 🎉</div>';
  document.getElementById('summaryList').innerHTML='Showing: <b style="color:#be185d">'+filterText+'</b><br>Total Income (Filtered): <b style="color:#ec4899">'+fmt(displayInc)+'</b> (All time '+fmt(incAll)+')<br>Total Expenses + Loan Payments (Filtered): <b style="color:#ff6b8a">'+fmt(displayExp)+'</b> (All time '+fmt(expAll)+')<br><div style="margin:8px 0;padding:10px;background:linear-gradient(135deg,#fff0f6,#f3e8ff);border-radius:12px;border:1px solid #f9a8d4"><b>💰 AVAILABLE FUND = Filtered Income - Filtered Expenses</b><br><span style="font-size:20px;color:#be185d;font-weight:800">'+fmt(topAvailable)+'</span><br><small>Filtered: '+filterText+'</small><br><small>All Time Available: '+fmt(availableAll)+'</small></div>Total Bills Monthly: <b>'+fmt(billsM)+'</b><br>Total Loans Remaining: <b style="color:#a78bfa">'+fmt(loansRem)+'</b><br>Total Savings: <b style="color:#ec4899">'+fmt(savingsTotal)+'</b>';
  updateSaveSelect();
}