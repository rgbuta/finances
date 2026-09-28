// ================= FIREBASE CONFIG - PALITAN MO BOSS NG SARILI MONG CONFIG =================
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
let dbFirebase = null;
let useFirebase = false;
let firebaseDocRef = null;

function initFirebase() {
  try {
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
      console.log("Firebase not configured yet - using localStorage");
      document.getElementById('firebaseStatus').textContent = "⚠️ Local Storage Mode - Configure Firebase";
      document.getElementById('firebaseStatus').style.background = "#fff3cd";
      return false;
    }
    firebase.initializeApp(firebaseConfig);
    dbFirebase = firebase.firestore();
    useFirebase = true;
    firebaseDocRef = dbFirebase.collection('boss_christine_users').doc('main_user_2026_2036');
    document.getElementById('firebaseStatus').textContent = "🔥 Firebase Connected";
    document.getElementById('firebaseStatus').style.background = "#d4edda";
    document.getElementById('firebaseStatus').style.color = "#155724";

    firebaseDocRef.onSnapshot((doc) => {
      if (doc.exists) {
        let data = doc.data();
        if (data && data.db) {
          db = data.db;
          if(!db.income)db.income=[];if(!db.expense)db.expense=[];if(!db.bills)db.bills=[];if(!db.loans)db.loans=[];if(!db.savingsTx)db.savingsTx=[];
          if(!db.savings){
            db.savings={
              emergency:{name:'Emergency Fund',amount:0,goal:50000,icon:'🛡️',color:'#ec4899',custom:false},
              education:{name:'Education Fund',amount:0,goal:100000,icon:'🎓',color:'#8b7cf8',custom:false},
              savings:{name:'General Savings',amount:0,goal:200000,icon:'💖',color:'#f472b6',custom:false},
              travel:{name:'Travel Fund',amount:0,goal:50000,icon:'✈️',color:'#fb7185',custom:false},
              business:{name:'Business Fund',amount:0,goal:100000,icon:'💼',color:'#a78bfa',custom:false},
              house:{name:'House Fund',amount:0,goal:500000,icon:'🏠',color:'#fbbf24',custom:false}
            };
          }
          render();
        }
      } else {
        saveToFirebase();
      }
    });
    return true;
  } catch (e) {
    console.error("Firebase init error", e);
    document.getElementById('firebaseStatus').textContent = "❌ Firebase Error - Using Local";
    return false;
  }
}

function saveToFirebase() {
  if (!useFirebase ||!firebaseDocRef) {
    localStorage.setItem('boss_christine_v15_2026_2036', JSON.stringify(db));
    return;
  }
  firebaseDocRef.set({
    db: db,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }).catch((err) => {
    console.error("Firebase save error", err);
    localStorage.setItem('boss_christine_v15_2026_2036', JSON.stringify(db));
  });
}

function migrateToFirebase() {
  if (!useFirebase) {
    alert("Configure Firebase muna boss! Palitan mo yung firebaseConfig sa app.js");
    return;
  }
  if (confirm("Migrate lahat ng local data to Firebase boss?")) {
    saveToFirebase();
    alert("Migrated to Firebase! 🔥");
  }
}

// ================= ORIGINAL LOGIC - WALANG BINAGO BOSS =================
function parseMoney(s){ if(!s) return 0; return Number(String(s).replace(/,/g,'').replace(/[^0-9]/g,''))||0; }
function formatInput(el){ var raw=el.value.replace(/[^0-9]/g,''); if(raw===''){el.value='';return;} el.value=Number(raw).toLocaleString('en-US'); }
document.addEventListener('DOMContentLoaded', function(){
  ['incAmount','expAmount','billAmt','loanTotal','loanMonthly','loanPaid','saveAmt','customGoal'].forEach(function(id){
    var e=document.getElementById(id); if(e) e.addEventListener('input',function(){formatInput(this);});
  });
  document.getElementById('incDate').value=new Date().toISOString().slice(0,10);
  document.getElementById('expDate').value=new Date().toISOString().slice(0,10);
  document.getElementById('yearFilter').value='all';
  document.getElementById('monthFilter').value='all';
  initFirebase();
  if(!useFirebase){
    loadLocal();
  }
});

let cur=new Date();
let selectedYear='all';
let selectedMonth='all';

function getOldData(){
  let keys=['boss_christine_v15_2026_2036','boss_christine_v14_filter','boss_christine_v13_girly','boss_christine_v12','boss_christine_v11'];
  for(let k of keys){
    let raw=localStorage.getItem(k);
    if(raw){ try{ let d=JSON.parse(raw); if(d.income||d.savings) return d; }catch(e){} }
  }
  return null;
}

let db=JSON.parse(localStorage.getItem('boss_christine_v15_2026_2036')||'null');
function loadLocal(){
  if(!db){
    let old=getOldData();
    if(old){ db=old; }else{ db={}; }
  }
  if(!db.income)db.income=[];if(!db.expense)db.expense=[];if(!db.bills)db.bills=[];if(!db.loans)db.loans=[];if(!db.savingsTx)db.savingsTx=[];
  if(!db.savings){
    db.savings={
      emergency:{name:'Emergency Fund',amount:0,goal:50000,icon:'🛡️',color:'#ec4899',custom:false},
      education:{name:'Education Fund',amount:0,goal:100000,icon:'🎓',color:'#8b7cf8',custom:false},
      savings:{name:'General Savings',amount:0,goal:200000,icon:'💖',color:'#f472b6',custom:false},
      travel:{name:'Travel Fund',amount:0,goal:50000,icon:'✈️',color:'#fb7185',custom:false},
      business:{name:'Business Fund',amount:0,goal:100000,icon:'💼',color:'#a78bfa',custom:false},
      house:{name:'House Fund',amount:0,goal:500000,icon:'🏠',color:'#fbbf24',custom:false}
    };
  }
  render();
}
if(!db){
  db={};
  loadLocal();
}

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
function addLoan(){let name=document.getElementById('loanName').value.trim(),total=parseMoney(document.getElementById('loanTotal').value),monthly=parseMoney(document.getElementById('loanMonthly').value),paid=parseMoney(document.getElementById('loanPaid').value);if(!name||!total)return alert('Complete boss');db.loans.push({id:Date.now(),name:name,total:total,monthly:monthly,paid:paid});save();render();document.getElementById('loanName').value='';document.getElementById('loanTotal').value='';document.getElementById('loanMonthly').value='';document.getElementById('loanPaid').value='';}
function payLoan(id){let amt=parseMoney(prompt('Payment boss?'));if(!amt)return;let l=db.loans.find(function(x){return x.id===id});l.paid+=amt;db.expense.push({id:Date.now(),category:'Loan Payment',amount:amt,date:new Date().toISOString().slice(0,10),note:l.name+' payment',month:mk(new Date())});save();render();}
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
  let loansRem=db.loans.reduce(function(s,l){return s+(l.total-l.paid)},0);
  let savingsTotal=0;for(var k in db.savings){savingsTotal+=db.savings[k].amount;}
  let displayInc=(selectedYear==='all'&&selectedMonth==='all')?incAll:incFiltered;
  let displayExp=(selectedYear==='all'&&selectedMonth==='all')?expAll:expFiltered;
  document.getElementById('totalIncome').textContent=fmt(displayInc);
  document.getElementById('totalExpense').textContent=fmt(displayExp);
  document.getElementById('totalBills').textContent=fmt(billsM);
  document.getElementById('totalLoans').textContent=fmt(loansRem);
  document.getElementById('netWorth').textContent=fmt(displayInc-displayExp+savingsTotal);
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
    var pct=Math.min(100,Math.round(l.paid/l.total*100));
    loansHtml+='<div class="card"><div style="display:flex;justify-content:space-between"><b>'+l.name+'</b><small style="background:#f3e8ff;color:#a78bfa;padding:4px 8px;border-radius:99px">'+pct+'% paid</small></div><div class="bar" style="margin:10px 0;height:10px"><i style="width:'+pct+'%;background:linear-gradient(90deg,#c084fc,#f472b6)"></i></div><div style="font-size:11px;color:var(--muted)">'+fmt(l.paid)+' / '+fmt(l.total)+' • Rem '+fmt(l.total-l.paid)+' • Monthly '+fmt(l.monthly)+'</div><div style="display:flex;gap:8px;margin-top:12px"><button class="btn-purple" style="padding:10px" onclick="payLoan('+l.id+')">Pay Loan ✨</button><button class="btn-del" style="padding:10px" onclick="delLoan('+l.id+')">🗑️ Delete</button></div></div>';
  });
  document.getElementById('loansList').innerHTML=loansHtml||'<div class="card"><small>No loans</small></div>';
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
  document.getElementById('summaryList').innerHTML='Showing: <b style="color:#be185d">'+filterText+'</b><br>Total Income: <b style="color:#ec4899">'+fmt(displayInc)+'</b> (All time '+fmt(incAll)+')<br>Total Expenses: <b style="color:#ff6b8a">'+fmt(displayExp)+'</b> (All time '+fmt(expAll)+')<br>Total Bills Monthly: <b style="color:#f97316">'+fmt(billsM)+'</b><br>Total Loans Remaining: <b style="color:#a78bfa">'+fmt(loansRem)+'</b><br>Total Savings (All Funds): <b style="color:#ec4899">'+fmt(savingsTotal)+'</b><br>Net Worth (Filtered): <b style="color:#be185d">'+fmt(displayInc-displayExp+savingsTotal)+'</b><br>Net Worth (All Time): <b>'+fmt(incAll-expAll+savingsTotal)+'</b>';
  updateSaveSelect();
}

