// 🔹 Firebase კონფიგურაცია
const firebaseConfig = {
  apiKey: "AIzaSyDb7J991NY2LYfD0ltU6fZJJYHBN5DTmFc",
  authDomain: "secretsanta-ba640.firebaseapp.com",
  databaseURL: "https://secretsanta-ba640-default-rtdb.firebaseio.com",
  projectId: "secretsanta-ba640",
  storageBucket: "secretsanta-ba640.firebasestorage.app",
  messagingSenderId: "325549905595",
  appId: "1:325549905595:web:12b33dc0c0102575277b9e",
  measurementId: "G-CH060YRTKV"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const playersRef = db.ref('players');
const pairsRef = db.ref('pairs');
const gameStatusRef = db.ref('gameStatus');

// 🔐 ორგანიზატორის სახელი
const ORGANIZER_NAME = "Gurami"; // შეცვალე შენი სახელით ზუსტად ისე, როგორც წერ შიგნით თამაშში

// ===============================
// 👥 მოთამაშეების ჩვენება რეალურ დროში
// ===============================
playersRef.on('value', snapshot => {
  const data = snapshot.val() || {};
  const list = Object.values(data).map(p => p.name);
  updatePlayerList(list);
});

function updatePlayerList(list) {
  const ul = document.getElementById('playerList');
  ul.innerHTML = '';
  const select = document.getElementById('playerSelect');
  select.innerHTML = '<option value="">აირჩიე...</option>';

  list.forEach(name => {
    const li = document.createElement('li');
    li.textContent = name;
    ul.appendChild(li);

    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
}

// ===============================
// ➕ მოთამაშის დამატება
// ===============================
function addPlayer() {
  const name = document.getElementById('nameInput').value.trim();
  if (!name) return;

  // თუ თამაში უკვე დაწყებულია — აღარ დაემატოს
  gameStatusRef.once('value', snap => {
    if (snap.val() === 'started') {
      alert('თამაში უკვე დაწყებულია — ახალი მოთამაშეების დამატება აღარ შეიძლება!');
      return;
    }

    // ვამოწმებთ დუბლიკატს
    playersRef.once('value', snapshot => {
      const data = snapshot.val() || {};
      const exists = Object.values(data).some(p => p.name === name);
      if (exists) {
        alert('ეს სახელი უკვე დამატებულია!');
      } else {
        playersRef.push({ name });
        document.getElementById('nameInput').value = '';
      }
    });
  });
}

// ===============================
// 🎄 თამაშის დაწყება (მხოლოდ ორგანიზატორი)
// ===============================
function startGame() {
  const selected = document.getElementById('playerSelect').value;

  if (selected !== ORGANIZER_NAME) {
    alert('მხოლოდ ორგანიზატორს შეუძლია თამაშის დაწყება!');
    return;
  }

  playersRef.once('value', snapshot => {
    const data = snapshot.val() || {};
    const names = Object.values(data).map(p => p.name);

    if (names.length < 3) {
      alert('მინიმუმ 3 მონაწილე აუცილებელია!');
      return;
    }

    const uniqueNames = [...new Set(names)];
    if (uniqueNames.length !== names.length) {
      alert('გაიმეორა მონაწილე! დუბლიკატები ამოიშლება.');
    }

    const namesToUse = uniqueNames;
    let receivers = [...namesToUse];
    let valid = false;

    while (!valid) {
      receivers.sort(() => Math.random() - 0.5);
      valid = namesToUse.every((n, i) => n !== receivers[i]);
    }

    let pairs = {};
    namesToUse.forEach((n, i) => {
      pairs[n] = receivers[i];
    });

    pairsRef.set(pairs);
    gameStatusRef.set('started');
    alert('თამაში დაიწყო! 🎅');
  });
}

// ===============================
// 👀 საკუთარი მიმღის ნახვა
// ===============================
function revealSanta() {
  const selected = document.getElementById('playerSelect').value;
  if (!selected) {
    alert('აირჩიეთ თქვენი სახელი');
    return;
  }

  pairsRef.child(selected).once('value', snapshot => {
    const receiver = snapshot.val();
    if (receiver) {
      document.getElementById('result').textContent =
        `${selected}, შენ უნდა აჩუქო: ${receiver} 🎁`;
    } else {
      document.getElementById('result').textContent =
        'თამაში ჯერ არ დაწყებულა.';
    }
  });
}

// ===============================
// 🧹 თამაშის განულება (მხოლოდ ორგანიზატორი)
// ===============================
function resetGame() {
  const selected = document.getElementById('playerSelect').value;

  if (selected !== ORGANIZER_NAME) {
    alert('მხოლოდ ორგანიზატორს შეუძლია თამაშის განულება!');
    return;
  }

  if (confirm('ნამდვილად გსურთ თამაშის განულება?')) {
    playersRef.remove();
    pairsRef.remove();
    gameStatusRef.remove();
    document.getElementById('result').textContent = '';
    alert('თამაში განულდა ✅');
  }
}
