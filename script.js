// ================= FIREBASE CONFIG - NAKA-CONFIGURE NA NI BOSS =================
const firebaseConfig = {
  apiKey: "AIzaSyCemGkC9X-qGXP85yfOHWAaA_U8I8svYu0",
  authDomain: "myprofile1124.firebaseapp.com",
  projectId: "myprofile1124",
  storageBucket: "myprofile1124.firebasestorage.app",
  messagingSenderId: "317629844028",
  appId: "1:317629844028:web:98eae3b815e89012e7d139",
  measurementId: "G-2KEP28KTLR"
};
// ==============================================================================================

let dbFirebase = null;
let useFirebase = false;
let firebaseDocRef = null;
let isFirstLoad = true;

function getLocalDb() {
  let keys = ['boss_christine_v15_2026_2036','boss_christine_v14_filter','boss_christine_v13_girly','boss_christine_v12','boss_christine_v11','boss_christine_v10'];
  for (let k of keys) {
    try {
      let raw = localStorage.getItem(k);
      if (raw) {
        let d = JSON.parse(raw);
        if (d && (d.income || d.savings || d.expense)) {
          return d;
        }
      }
    } catch(e){}
  }
  return null;
}

function getDefaultDb() {
  return {
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
}

function initFirebase() {
  try {
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
      document.getElementById('firebaseStatus').textContent = "⚠️ Local Storage Mode";
      document.getElementById('firebaseStatus').style.background = "#fff3cd";
      loadLocalAndRender();
      return false;
    }
    firebase.initializeApp(firebaseConfig);
    dbFirebase = firebase.firestore();
    useFirebase = true;
    firebaseDocRef = dbFirebase.collection('boss_christine_users').doc('main_user_2026_2036');
    document.getElementById('firebaseStatus').textContent = "🔥 Firebase Connected - Syncing...";
    document.getElementById('firebaseStatus').style.background = "#d4edda";
    document.getElementById('firebaseStatus').style.color = "#155724";

    firebaseDocRef.onSnapshot((doc) => {
      if (doc.exists) {
        let data = doc.data();
        if (data && data.db) {
          db = data.db;
          if(!db.income)db.income=[];if(!db.expense)db.expense=[];if(!db.bills)db.bills=[];if(!db.loans)db.loans=[];if(!db.savingsTx)db.savingsTx=[];
          if(!db.savings) db.savings = getDefaultDb().savings;
          db.loans = db.loans.map(l=>{
            if(l.total &&!l.amount){
              return {id:l.id, name:l.name, amount:l.total, term: l.term || Math.ceil(l.total/(l.monthly||1)), monthly:l.monthly||0, paid:l.paid||0, payments:l.payments||[], startDate:l.startDate||new Date().toISOString().slice(0,10)}
            }
            if(!l.payments) l.payments=[];
            if(l.paid==null) l.paid=0;
            if(!l.term) l.term=12;
            if(!l.startDate) l.startDate=new Date().toISOString().slice(0,10);
            return l;
          });
          if (isFirstLoad) {
            isFirstLoad = false;
            let local = getLocalDb();
            if (local && local.income && local.income.length > db.income.length) {
              db = local;
              saveToFirebase(true);
            }
          }
          render();
          document.getElementById('firebaseStatus').textContent = "🔥 Firebase Connected - Centralized DB";
        }
      } else {
        let local = getLocalDb();
        if (local) {
          db = local;
          if(!db.income)db.income=[];if(!db.expense)db.expense=[];if(!db.bills)db.bills=[];if(!db.loans)db.loans=[];if(!db.savingsTx)db.savingsTx=[];
          if(!db.savings) db.savings = getDefaultDb().savings;
        } else {
          db = getDefaultDb();
        }
        saveToFirebase(true);
        render();
      }
    }, (error) => {
      console.error("Firebase snapshot error:", error);
      document.getElementById('firebaseStatus').textContent = "❌ Firebase Error: " + error.message;
      document.getElementById('firebaseStatus').style.background = "#f8d7da";
      loadLocalAndRender();
    });
    return true;
  } catch (e) {
    console.error("Firebase init error", e);
    document.getElementById('firebaseStatus').textContent = "❌ Firebase Error - Using Local";
    loadLocalAndRender();
    return false;
  }
}

function saveToFirebase(forceLog) {
  if (!useFirebase ||!firebaseDocRef) {
    localStorage.setItem('boss_christine_v15_2026_2036', JSON.stringify(db));
    return;
  }
  firebaseDocRef.set({
    db: db,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    totalIncome: db.income.length,
    totalExpense: db.expense.length
  }).then(() => {
    localStorage.setItem('boss_christine_v15_2026_2036', JSON.stringify(db));
    document.getElementById('firebaseStatus').textContent = "🔥 Saved to Firebase Centralized DB ✅";
    setTimeout(() => {
      document.getElementById('firebaseStatus').textContent = "🔥 Firebase Connected - Centralized DB";
    }, 2000);
  }).catch((err) => {
    console.error("❌ Firebase save error", err);
    document.getElementById('firebaseStatus').textContent = "❌ Save Failed: " + err.message;
    alert("Firebase save failed boss: " + err.message);
    localStorage.setItem('boss_christine_v15_2026_2036', JSON.stringify(db));
  });
}

function migrateToFirebase() {
  if (!useFirebase) {
    alert("Configure Firebase muna boss!");
    return;
  }
  let local = getLocalDb() || db;
  db = local;
  saveToFirebase(true);
  alert("Migrated to Firebase Centralized DB! 🔥");
}

function loadLocalAndRender() {
  let local = getLocalDb();
  if (local) {
    db = local;
  } else {
    db = getDefaultDb();
  }
  if(!db.income)db.income=[];if(!db.expense)db.expense=[];if(!db.bills)db.bills=[];if(!db.loans)db.loans=[];if(!db.savingsTx)db.savingsTx=[];
  if(!db.savings) db.savings = getDefaultDb().savings;
  db.loans = db.loans.map(l=>{
    if(l.total &&!l.amount){
      return {id:l.id, name:l.name, amount:l.total, term: l.term || Math.ceil(l.total/(l.monthly||1)), monthly:l.monthly||0, paid:l.paid||0, payments:l.payments||[], startDate:l.startDate||new Date().toISOString().slice(0,10)}
    }
    if(!l.payments) l.payments=[];
    if(l.paid==null) l.paid=0;
    return l;
  });
  render();
}

function parseMoney(s){ if(!s) return 0; return Number(String(s).replace(/,/g,'').replace(/[^0-9]/g,''))||0; }
function formatInput(el){ var raw=el.value.replace(/[^0-9]/g,''); if(raw===''){el.value='';return;} el.value=Number(raw).toLocaleString('en-US'); }
document.addEventListener('DOMContentLoaded', function(){
  ['incAmount','expAmount','billAmt','loanTotal','loanAmount','loanMonthly','loanPaid','saveAmt','customGoal'].forEach(function(id){
    var e=document.getElementById(id); if(e) e.addEventListener('input',function(){formatInput(this);});
  });
  let incDateEl = document.getElementById('incDate');
  if(incDateEl) incDateEl.value=new Date().toISOString().slice(0,10);
  let expDateEl = document.getElementById('expDate');
  if(expDateEl) expDateEl.value=new Date().toISOString().slice(0,10);
  let loanStartEl = document.getElementById('loanStart');
  if(loanStartEl) loanStartEl.value=new Date().toISOString().slice(0,10);
  let yearEl = document.getElementById('yearFilter');
  if(yearEl) yearEl.value='all';
  let monthEl = document.getElementById('monthFilter');
  if(monthEl) monthEl.value='all';
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

let cur=new Date();
let selectedYear='all';
let selectedMonth='all';
let db = getDefaultDb();

function save(){ saveToFirebase(); }
function mk(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');}
function fmt(n){return '₱'+Number(n||0).toLocaleString('en-PH');}
function tab(id,el){document.querySelectorAll('.section').forEach(function(s){s.classList.remove('active');});document.getElementById(id).classList.add('active');document.querySelectorAll('.navbtn').forEach(function(b){b.classList.remove('active');});el.classList.add('active');}
function changeFilter(){ selectedYear=document.getElementById('yearFilter').value; selectedMonth=document.getElementById('monthFilter').value; render(); }
function resetFilter(){ selectedYear='all'; selectedMonth='all'; document.getElementById('yearFilter').value='all'; document.getElementById('monthFilter').value='all'; render(); }
function isFiltered(item){ if(selectedYear==='all' && selectedMonth==='all') return true; if(!item.date) return true; let y=item.date.slice(0,4); let m=item.date.slice(5,7); if(selectedYear!=='all' && y!==selectedYear) return false; if(selectedMonth!=='all' && m!==selectedMonth) return false; return true; }
function getFiltered(arr){return arr.filter(isFiltered);}
function addIncome(){let amt=parseMoney(document.getElementById('incAmount').value);if(!amt)return alert('Amount boss 💖');let dateVal=document.getElementById('incDate').value||new Date().toISOString().slice(0,10);let monthVal=dateVal.slice(0,7);db.income.push({id:Date.now(),source:document.getElementById('incSource').value,amount:amt,date:dateVal,note:document.getElementById('incNote').value||document.getElementById('incSource').value,month:monthVal});save();render();document.getElementById('incAmount').value='';}
function addExpense(){let amt=parseMoney(document.getElementById('expAmount').value);if(!amt)return alert('Amount boss');let dateVal=document.getElementById('expDate').value||new Date().toISOString().slice(0,10);let monthVal=dateVal.slice(0,7);db.expense.push({id:Date.now(),category:document.getElementById('expCat').value,amount:amt,date:dateVal,note:document.getElementById('expNote').value||document.getElementById('expCat').value,month:monthVal});save();render();document.getElementById('expAmount').value='';}
function addBill(){let name=document.getElementById('billName').value.trim(),amt=parseMoney(document.getElementById('billAmt').value);if(!name||!amt)return alert('Complete boss');db.bills.push({id:Date.now(),name:name,amount:amt,due:document.getElementById('billDue').value,paidMonths:[]});save();render();document.getElementById('billName').value='';document.getElementById('billAmt').value='';}
function toggleBill(id){let b=db.bills.find(function(x){return x.id===id});let m=mk(new Date());if(b.paidMonths.includes(m)){b.paidMonths=b.paidMonths.filter(function(x){return x!==m});}else{b.paidMonths.push(m);db.expense.push({id:Date.now(),category:'Bills',amount:b.amount,date:new Date().toISOString().slice(0,10),note:b.name,month:m});}save();render();}

function addLoan(){
  let nameEl = document.getElementById('loanName');
  let name = nameEl? nameEl.value.trim() : '';
  let totalEl = document.getElementById('loanTotal');
  let amountEl = document.getElementById('loanAmount');
  let amount = 0;
  if(amountEl) amount = parseMoney(amountEl.value);
  else if(totalEl) amount = parseMoney(totalEl.value);
  let termEl = document.getElementById('loanTerm');
  let term = termEl? parseInt(termEl.value)||12 : 12;
  let monthlyEl = document.getElementById('loanMonthly');
  let monthly = monthlyEl? parseMoney(monthlyEl.value) : 0;
  let paidEl = document.getElementById('loanPaid');
  let paidInit = paidEl? parseMoney(paidEl.value) : 0;
  let startEl = document.getElementById('loanStart');
  let start = startEl? startEl.value || new Date().toISOString().slice(0,10) : new Date().toISOString().slice(0,10);
  if(!name ||!amount) return alert('Loan Name and Loan Amount required boss 💖');
  if(!monthly) monthly = Math.ceil(amount/term);
  db.loans.push({id:Date.now(), name:name, amount:amount, term:term, monthly:monthly, paid:paidInit, payments: paidInit? [{id:Date.now(), date:start, month:start.slice(0,7), amount:paidInit}] : [], startDate:start});
  save();render();
  if(nameEl) nameEl.value='';
  if(amountEl) amountEl.value='';
  if(totalEl) totalEl.value='';
  if(monthlyEl) monthlyEl.value='';
  if(paidEl) paidEl.value='';
}
function payLoan(id){
  let l=db.loans.find(function(x){return x.id===id});
  if(!l) return;
  if(l.paid >= l.amount) return alert('Fully paid na boss! 🎉');
  let remaining = l.amount - l.paid;
  let input = prompt(`Pay for ${l.name}?\nLoan Amount: ${fmt(l.amount)}\nTerm: ${l.term} months\nMonthly: ${fmt(l.monthly)}\nRemaining: ${fmt(remaining)}\n\nEnter amount to pay:`, l.monthly.toLocaleString());
  if(!input) return;
  let amt=parseMoney(input);
  if(!amt) return alert('Invalid amount boss');
  if(l.paid+amt > l.amount) amt = l.amount - l.paid;
  l.paid+=amt;
  l.payments.push({id:Date.now(), date:new Date().toISOString().slice(0,10), month:mk(new Date()), amount:amt});
  db.expense.push({id:Date.now(),category:'Loan Payment',amount:amt,date:new Date().toISOString().slice(0,10),note:l.name+' - Monthly Payment',month:mk(new Date())});
  save();render();
}
function payFullLoan(id){
  let l=db.loans.find(function(x){return x.id===id});
  if(!l) return;
  let remaining = l.amount - l.paid;
  if(remaining<=0) return alert('Fully paid na boss! 🎉');
  if(!confirm(`Pay full remaining ${fmt(remaining)} for ${l.name} boss?`)) return;
  l.paid = l.amount;
  l.payments.push({id:Date.now(), date:new Date().toISOString().slice(0,10), month:mk(new Date()), amount:remaining});
  db.expense.push({id:Date.now(),category:'Loan Payment',amount:remaining,date:new Date().toISOString().slice(0,10),note:l.name+' - Full Payment',month:mk(new Date())});
  save();render();
}
function addToSaving(){let key=document.getElementById('saveType').value,amt=parseMoney(document.getElementById('saveAmt').value),note=document.getElementById('saveNote').value||'Add';if(!amt)return alert('Amount boss');if(!db.savings[key])return alert('Select fund boss');db.savings[key].amount+=amt;db.savingsTx.push({id:Date.now(),key:key,amount:amt,note:note,date:new Date().toISOString().slice(0,10),month:mk(new Date()),type:'add'});save();render();document.getElementById('saveAmt').value='';}
function createCustom(){let name=document.getElementById('customName').value.trim(),goal=parseMoney(document.getElementById('customGoal').value)||100000,icon=document.getElementById('customIcon').value||'💖',color=document.getElementById('customColor').value;if(!name)return alert('Name required boss');let key=name.toLowerCase().replace(/ /g,'_')+'_'+Date.now();db.savings[key]={name:name,amount:0,goal:goal,icon:icon,color:color,custom:true};save();render();updateSaveSelect();document.getElementById('customName').value='';document.getElementById('customGoal').value='';}
function withdrawSaving(key){let amt=parseMoney(prompt('Withdraw amount?'));if(!amt||amt>db.savings[key].amount)return alert('Invalid boss');db.savings[key].amount-=amt;db.savingsTx.push({id:Date.now(),key:key,amount:amt,note:'Withdraw',date:new Date().toISOString().slice(0,10),month:mk(new Date()),type:'withdraw'});save();render();}
function editSaving(key){let newName=prompt('Edit name:',db.savings[key].name); if(newName) db.savings[key].name=newName; let newGoal=parseMoney(prompt('Edit Goal Amount:',db.savings[key].goal.toLocaleString())); if(newGoal) db.savings[key].goal=newGoal; save();render();updateSaveSelect();}
function delSaving(key){let name=db.savings[key].name;if(confirm('Delete fund "'+name+'" boss? Meron '+fmt(db.savings[key].amount)+' dito. Sure ka?')){delete db.savings[key];db.savingsTx=db.savingsTx.filter(function(t){return t.key!==key});save();render();updateSaveSelect();}}
function delIncome(id){if(confirm('Delete income?')){db.income=db.income.filter(function(x){return x.id!==id});save();render();}}
function delExpense(id){if(confirm('Delete expense?')){db.expense=db.expense.filter(function(x){return x.id!==id});save();render();}}
function delBill(id){if(confirm('Delete bill?')){db.bills=db.bills.filter(function(x){return x.id!==id});save();render();}}
function delLoan(id){if(confirm('Delete loan?')){db.loans=db.loans.filter(function(x){return x.id!==id});save();render();}}
function delSavingsTx(id){let tx=db.savingsTx.find(function(x){return x.id===id});if(!tx)return;if(confirm('Delete & reverse '+fmt(tx.amount)+'?')){if(tx.type==='add'&&db.savings[tx.key])db.savings[tx.key].amount-=tx.amount;else if(db.savings[tx.key]) db.savings[tx.key].amount+=tx.amount;db.savingsTx=db.savingsTx.filter(function(x){return x.id!==id});save();render();}}
function clearIncome(){if(confirm('Clear ALL income?')){db.income=[];save();render();}}
function clearExpense(){if(confirm('Clear ALL expense?')){db.expense=[];save();render();}}
function clearBills(){if(confirm('Delete ALL bills?')){db.bills=[];save();render();}}
function clearLoans(){if(confirm('Delete ALL loans?')){db.loans=[];save();render();}}
function clearSavingsTx(){if(confirm('Clear history?')){db.savingsTx=[];save();render();}}
function clearAllData(){if(confirm('DELETE ALL DATA boss?')){if(confirm('Sure ka?')){localStorage.removeItem('boss_christine_v15_2026_2036'); if(useFirebase && firebaseDocRef){ firebaseDocRef.delete(); } location.reload();}}}
function exportData(){var blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download='boss-christine-v15-firebase.json';a.click();}
function updateSaveSelect(){var sel=document.getElementById('saveType');if(!sel)return;var html='';for(var k in db.savings){var v=db.savings[k];html+='<option value="'+k+'">'+v.icon+' '+v.name+' - '+fmt(v.amount)+' / Goal '+fmt(v.goal)+'</option>';}sel.innerHTML=html||'<option>No funds</option>';}
function render(){
  let m=mk(new Date());
  let filteredIncome=getFiltered(db.income);
  let filteredExpense=getFiltered(db.expense);
  let filteredSavingsTx=getFiltered(db.savingsTx);
  let incAll=db.income.reduce(function(s,x){return s+x.amount},0);
  let expAll=db.expense.reduce(function(s,x){return s+x.amount},0);
  let incFiltered=filteredIncome.reduce(function(s,x){return s+x.amount},0);
  let expFiltered=filteredExpense.reduce(function(s,x){return s+x.amount},0);
  let billsM=db.bills.reduce(function(s,b){return s+b.amount},0);
  let loansRem=db.loans.reduce(function(s,l){ let amt=l.amount||l.total||0; let paid=l.paid||0; return s+(amt-paid); },0);
  let savingsTotal=0;for(var k in db.savings){savingsTotal+=db.savings[k].amount;}
  let displayInc=(selectedYear==='all'&&selectedMonth==='all')?incAll:incFiltered;
  let displayExp=(selectedYear==='all'&&selectedMonth==='all')?expAll:expFiltered;
  let availableAll = incAll - expAll;
  let availableFiltered = displayInc - displayExp;
  let topAvailable = (selectedYear==='all'&&selectedMonth==='all')? availableAll : availableFiltered;
  let availEl = document.getElementById('availableFund');
  if(availEl) availEl.textContent = fmt(topAvailable);
  let netWorthEl = document.getElementById('netWorth');
  if(netWorthEl) netWorthEl.textContent = fmt(topAvailable);
  document.getElementById('totalIncome').textContent=fmt(displayInc);
  document.getElementById('totalExpense').textContent=fmt(displayExp);
  document.getElementById('totalBills').textContent=fmt(billsM);
  document.getElementById('totalLoans').textContent=fmt(loansRem);
  let monthNames=['','January','February','March','April','May','June','July','August','September','October','November','December'];
  let filterText='';
  if(selectedYear==='all'&&selectedMonth==='all'){filterText='Showing: ALL TIME ✨';document.getElementById('filterLabel').textContent='ALL TIME';}
  else if(selectedYear!=='all'&&selectedMonth==='all'){filterText='Year '+selectedYear;document.getElementById('filterLabel').textContent='Year '+selectedYear;}
  else if(selectedYear==='all'&&selectedMonth!=='all'){filterText=monthNames[parseInt(selectedMonth)];document.getElementById('filterLabel').textContent=monthNames[parseInt(selectedMonth)];}
  else{filterText=monthNames[parseInt(selectedMonth)]+' '+selectedYear;document.getElementById('filterLabel').textContent=monthNames[parseInt(selectedMonth)]+' '+selectedYear;}
  document.getElementById('monthLabel').textContent=filterText;
  document.getElementById('totalIncomeMonth').textContent=(selectedYear==='all'&&selectedMonth==='all')?'All time total':'Filtered: '+filterText;
  document.getElementById('totalExpenseMonth').textContent=(selectedYear==='all'&&selectedMonth==='all')?'All time total':'Filtered: '+filterText;
  document.getElementById('incomeTitle').textContent='Income History - '+filterText;
  document.getElementById('expenseTitle').textContent='Expense History - '+filterText;
  var dashHtml='';
  for(var k in db.savings){
    var v=db.savings[k];
    var pct=Math.min(100,Math.round(v.amount/v.goal*100))||0;
    dashHtml+='<div class="fund" style="border-left:4px solid '+v.color+'"><small>'+v.icon+' '+v.name.toUpperCase()+'</small><b>'+fmt(v.amount)+'</b><div class="bar"><i style="width:'+pct+'%;background:linear-gradient(90deg,'+v.color+',#f9a8d4)"></i></div><small>'+pct+'% of '+fmt(v.goal)+'</small></div>';
  }
  document.getElementById('dashboardFunds').innerHTML=dashHtml||'<div class="fund"><small>No savings yet</small></div>';
  var incomeHtml='';
  filteredIncome.slice().reverse().forEach(function(x){
    incomeHtml+='<div class="item"><div><b style="font-size:12px">'+x.note+'</b><div style="font-size:10px;color:var(--muted)">'+x.source+' • '+x.date+'</div></div><div style="display:flex;gap:6px;align-items:center"><b style="color:#ec4899;font-size:12px">'+fmt(x.amount)+'</b><button class="btn-del" onclick="delIncome('+x.id+')">🗑️</button></div></div>';
  });
  document.getElementById('incomeList').innerHTML=incomeHtml||'<div style="text-align:center;color:var(--muted);padding:12px">No income for '+filterText+' 💅</div>';
  var expenseHtml='';
  filteredExpense.slice().reverse().forEach(function(x){
    expenseHtml+='<div class="item"><div><b style="font-size:12px">'+x.note+'</b><div style="font-size:10px;color:var(--muted)">'+x.category+' • '+x.date+'</div></div><div style="display:flex;gap:6px;align-items:center"><b style="color:#ff6b8a;font-size:12px">'+fmt(x.amount)+'</b><button class="btn-del" onclick="delExpense('+x.id+')">🗑️</button></div></div>';
  });
  document.getElementById('expenseList').innerHTML=expenseHtml||'<div style="text-align:center;color:var(--muted);padding:12px">No expense for '+filterText+'</div>';
  var billsHtml='';
  db.bills.forEach(function(b){
    var paid=b.paidMonths.includes(m);
    billsHtml+='<div class="item"><div><b style="font-size:12px">'+b.name+'</b><div style="font-size:10px;color:var(--muted)">Due '+b.due+'th • '+fmt(b.amount)+'</div></div><div style="display:flex;gap:6px"><button style="width:auto;padding:7px 14px;font-size:11px;background:'+(paid?'#fff0f6':'linear-gradient(135deg,#8b7cf8,#a78bfa)')+';color:'+(paid?'#be185d':'white')+';border:'+(paid?'1px solid #f9d5e5':'none')+';border-radius:99px" onclick="toggleBill('+b.id+')">'+(paid?'💖 Paid':'Pay')+'</button><button class="btn-del" onclick="delBill('+b.id+')">🗑️</button></div></div>';
  });
  document.getElementById('billsList').innerHTML=billsHtml||'<div style="text-align:center;color:var(--muted);padding:12px">No bills</div>';
  var loansHtml='';
  db.loans.forEach(function(l){
    var amt = l.amount || l.total || 0;
    var paid = l.paid || 0;
    var pct=Math.min(100,Math.round(paid/amt*100))||0;
    var remaining = amt - paid;
    var term = l.term || 12;
    var paidMonths = Math.floor(paid/(l.monthly||1));
    var paymentsHtml = (l.payments||[]).slice(-3).reverse().map(function(p){ return '<div style="font-size:10px;color:var(--muted)">✅ '+p.date+' - '+fmt(p.amount)+'</div>'; }).join('');
    loansHtml+='<div class="card" style="border-left:4px solid #a78bfa"><div style="display:flex;justify-content:space-between;align-items:start"><div><b style="color:#6d28d9">'+l.name+'</b><div style="font-size:11px;color:var(--muted)">Start: '+(l.startDate||'N/A')+' • Term: '+term+' months • '+paidMonths+'/'+term+' paid</div></div><small style="background:#f3e8ff;color:#7c3aed;padding:4px 10px;border-radius:99px;font-weight:700">'+pct+'%</small></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:12px 0;text-align:center"><div style="background:#fdf4ff;padding:8px;border-radius:12px"><small style="font-size:9px">LOAN AMOUNT</small><br><b style="color:#be185d;font-size:12px">'+fmt(amt)+'</b></div><div style="background:#f5f3ff;padding:8px;border-radius:12px"><small style="font-size:9px">MONTHLY</small><br><b style="color:#7c3aed;font-size:12px">'+fmt(l.monthly)+'</b></div><div style="background:#fff1f2;padding:8px;border-radius:12px"><small style="font-size:9px">REMAINING</small><br><b style="color:#e11d48;font-size:12px">'+fmt(remaining)+'</b></div></div><div class="bar" style="margin:10px 0;height:12px"><i style="width:'+pct+'%;background:linear-gradient(90deg,#8b5cf6,#ec4899)"></i></div><div style="font-size:11px;color:var(--muted)">'+fmt(paid)+' / '+fmt(amt)+' paid • Remaining '+fmt(remaining)+' • '+(term-paidMonths)+' months left</div>'+(paymentsHtml?'<div style="margin-top:8px;padding:8px;background:#faf5ff;border-radius:8px"><small style="font-weight:700">Recent Payments:</small>'+paymentsHtml+'</div>':'')+'<div style="display:flex;gap:8px;margin-top:12px"><button class="btn-purple" style="flex:2;padding:12px" onclick="payLoan('+l.id+')" '+(remaining<=0?'disabled':'')+'>'+(remaining<=0?'🎉 Fully Paid':'💳 Pay Monthly '+fmt(l.monthly))+'</button>'+(remaining>0 && remaining!=l.monthly?'<button class="btn-ghost" style="flex:1;padding:12px" onclick="payFullLoan('+l.id+')">Pay Full</button>':'')+'<button class="btn-del" style="padding:12px" onclick="delLoan('+l.id+')">🗑️</button></div></div>';
  });
  document.getElementById('loansList').innerHTML=loansHtml||'<div class="card"><small>No loans yet - Add your first loan boss 💳</small></div>';
  var savingsHtml='';
  for(var k in db.savings){
    var v=db.savings[k];
    var pct=Math.min(100,Math.round(v.amount/v.goal*100))||0;
    savingsHtml+='<div class="card" style="border-left:4px solid '+v.color+'"><div style="display:flex;justify-content:space-between"><div><span style="font-size:16px">'+v.icon+'</span> <b style="color:#be185d">'+v.name+'</b></div><small style="background:'+v.color+'22;color:'+v.color+';padding:4px 10px;border-radius:99px;font-weight:700">'+pct+'%</small></div><h2 style="margin:10px 0;color:'+v.color+'">'+fmt(v.amount)+'</h2><small style="color:var(--muted)">Goal: '+fmt(v.goal)+' • Remaining: '+fmt(Math.max(0,v.goal-v.amount))+'</small><div class="bar" style="margin-top:10px;height:10px"><i style="width:'+pct+'%;background:linear-gradient(90deg,'+v.color+',#f9a8d4)"></i></div><div style="display:flex;gap:8px;margin-top:14px"><button class="btn-ghost" style="padding:10px;flex:1" onclick="withdrawSaving(\''+k+'\')">Withdraw</button><button class="btn-edit" style="padding:10px;flex:1" onclick="editSaving(\''+k+'\')">✏️ Edit Goal</button><button class="btn-del" style="padding:10px;flex:1" onclick="delSaving(\''+k+'\')">🗑️ Delete</button></div></div>';
  }
  document.getElementById('savingsGrid').innerHTML=savingsHtml||'<div class="card"><small>No savings funds yet</small></div>';
  var txHtml='';
  filteredSavingsTx.slice().reverse().slice(0,30).forEach(function(t){
    var sv=db.savings[t.key]; if(!sv) return;
    txHtml+='<div class="item"><div><b style="font-size:12px">'+sv.icon+' '+sv.name+'</b><div style="font-size:10px;color:var(--muted)">'+t.note+' • '+t.date+'</div></div><div style="display:flex;gap:6px;align-items:center"><b style="font-size:12px;color:'+(t.type==='add'?'#ec4899':'#ff6b8a')+'">'+(t.type==='add'?'+':'-')+fmt(t.amount)+'</b><button class="btn-del" onclick="delSavingsTx('+t.id+')">🗑️</button></div></div>';
  });
  document.getElementById('savingsTx').innerHTML=txHtml||'<div style="text-align:center;color:var(--muted);padding:12px">No transactions for '+filterText+' ✨</div>';
  document.getElementById('unpaidList').innerHTML=db.bills.filter(function(b){return!b.paidMonths.includes(m)}).map(function(b){return '<div class="item"><div><b>'+b.name+'</b><div style="font-size:10px;color:var(--muted)">Due '+b.due+'th</div></div><b style="color:#f97316">'+fmt(b.amount)+'</b></div>';}).join('')||'<div style="text-align:center;color:#ec4899;padding:12px">All bills paid! 🎉💖</div>';
  document.getElementById('summaryList').innerHTML='Showing: <b style="color:#be185d">'+filterText+'</b><br>Total Income: <b style="color:#ec4899">'+fmt(displayInc)+'</b> (All time '+fmt(incAll)+')<br>Total Expenses + Loan Payments: <b style="color:#ff6b8a">'+fmt(displayExp)+'</b> (All time '+fmt(expAll)+')<br><div style="margin:8px 0;padding:10px;background:linear-gradient(135deg,#fff0f6,#f3e8ff);border-radius:12px;border:1px solid #f9a8d4"><b>💰 AVAILABLE FUND = Income - Expenses - Loan Payments</b><br><span style="font-size:16px;color:#be185d;font-weight:800">'+fmt(displayInc-displayExp)+'</span> <small>(Filtered)</small> | All Time: <b style="color:#be185d">'+fmt(incAll-expAll)+'</b></div>Total Bills Monthly: <b style="color:#f97316">'+fmt(billsM)+'</b><br>Total Loans Remaining: <b style="color:#a78bfa">'+fmt(loansRem)+'</b><br>Total Savings: <b style="color:#ec4899">'+fmt(savingsTotal)+'</b><br>Net Worth (Available + Savings): <b>'+fmt((displayInc-displayExp)+savingsTotal)+'</b> | All Time: '+fmt(availableAll+savingsTotal);
  updateSaveSelect();
}