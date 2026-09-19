const fs = require('fs');
const path = require('path');

const engData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'words_dictionary.json'), 'utf-8')
);
const englishWords = Object.keys(engData);

const tagData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'tagalog_dictionary.json'), 'utf-8')
);
const tagalogWords = tagData.map(entry => entry.word.toLowerCase());

const dictionaryWords = [...englishWords, ...tagalogWords];
const longDictionaryWords = dictionaryWords.filter(word => word.length >= 8);

const symbols = ['!', '@', '#', '$', '%', '&', '*'];
const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const digits = '0123456789';

function randChar(str) {
  return str[Math.floor(Math.random() * str.length)];
}

function randomString(length) {
  let out = '';
  const all = letters + digits + '!@#$%&*';
  for (let i = 0; i < length; i++) {
    out += randChar(all);
  }
  return out;
}

// 🌟 ADVANCED PREPROCESSING & NORMALIZATION FUNCTION
function normalizePassword(rawPassword) {
  // 1. Palitan ang underscore (_) ng space
  let processed = rawPassword.replace(/_/g, ' ');

  // 2. I-substitute ang '7' bilang 'L' at i-normalize ang maliit na 'l' sa 'I'/'L'
  processed = processed.replace(/7/g, 'L');
  
  // 3. Alisin ang mga obfuscation symbols kung paulit-ulit (tulad ng @H_@$A_@$$P_@$$$P_@$$$$Y -> HAPPY o katulad nito)
  // Kinisin ang mga sobrang special characters na ginagamit pambalot ng letters
  processed = processed.replace(/[@$]/g, '');

  return processed.trim();
}

function detectSequence(password) {
  const clean = password.toLowerCase();
  const hasSeq = /(123|abc|234|bcd|qwe|012|345|678|901)/i.test(clean);
  const hasRepeatingPattern = /(.)\1{1,}/.test(clean);
  return { hasSeq, hasRepeatingPattern };
}

// 🌟 FULL FEATURE GENERATOR LOGIC
function buildFeatures(password, label, isDictionary) {
  const normalized = normalizePassword(password);
  const cleanPassword = (label === 'DICTIONARY') ? normalized.toLowerCase() : normalized;

  const lower = /[a-z]/.test(cleanPassword) ? 1 : 0;
  const upper = /[A-Z]/.test(cleanPassword) ? 1 : 0;
  const digit = /\d/.test(cleanPassword) ? 1 : 0;
  const sym = /[^a-zA-Z0-9]/.test(cleanPassword) ? 1 : 0;

  const charClassCount = lower + upper + digit + sym;
  const hasLeet = (/[@$40531!7]/.test(cleanPassword) && isDictionary) ? 1 : 0;
  
  const numPrefix = /^\d+/.test(cleanPassword) ? 1 : 0;
  const numSuffix = /\d+$/.test(cleanPassword) ? 1 : 0;
  const middlePart = cleanPassword.replace(/^\d+/, '').replace(/\d+$/, '');
  const numInfix = /\d+/.test(middlePart) ? 1 : 0;

  const seqCheck = detectSequence(cleanPassword);
  const hasSeq = seqCheck.hasSeq ? 1 : 0;
  const hasRep = seqCheck.hasRepeatingPattern ? 1 : 0;

  const rulePattern = (
    hasLeet ||
    numPrefix ||
    numSuffix ||
    numInfix ||
    hasSeq ||
    hasRep
  ) ? 1 : 0;

  return {
    password_sample: password,
    f_length: cleanPassword.length,
    f_char_class_count: charClassCount,
    f_has_lowercase: lower,
    f_has_uppercase: upper,
    f_has_digit: digit,
    f_has_symbol: sym,
    f_dictionary_present: isDictionary ? 1 : 0,
    f_has_leetspeak: hasLeet,
    f_numeric_prefix: numPrefix,
    f_numeric_suffix: numSuffix,
    f_numeric_infix: numInfix,
    f_has_sequence: hasSeq,
    f_has_repetition: hasRep,
    f_rule_pattern_present: rulePattern,
    label: label
  };
}

const rows = [];

// SHORT DICTIONARY
for (let i = 0; i < 100; i++) {
  rows.push(buildFeatures(dictionaryWords[Math.floor(Math.random() * dictionaryWords.length)], "DICTIONARY", 1));
}

// LONG DICTIONARY
for (let i = 0; i < 100; i++) {
  rows.push(buildFeatures(longDictionaryWords[Math.floor(Math.random() * longDictionaryWords.length)], "DICTIONARY", 1));
}

// RULE-BASED (May kasamang underscore, leetspeak, sequences)
for (let i = 0; i < 200; i++) {
  const word = dictionaryWords[Math.floor(Math.random() * dictionaryWords.length)];
  const variants = [
    word + '_',
    'Pogi_ako',
    'totoy_brown',
    'Beauty_@nd_th3_Be@$t',
    word + '012',
    word.replace(/a/g, '@').replace(/o/g, '0')
  ];
  rows.push(buildFeatures(variants[Math.floor(Math.random() * variants.length)], 'RULE-BASED', 1));
}

// BRUTE-FORCE (Sobrang random)
for (let i = 0; i < 200; i++) {
  const pass = randomString(10 + Math.floor(Math.random() * 5));
  rows.push(buildFeatures(pass, 'BRUTE-FORCE', 0));
}

// 🌟 CSV CREATION -> pinangalanang classification_dataset.csv
let csv = 'password_sample,f_length,f_char_class_count,f_has_lowercase,f_has_uppercase,f_has_digit,f_has_symbol,f_dictionary_present,f_has_leetspeak,f_numeric_prefix,f_numeric_suffix,f_numeric_infix,f_has_sequence,f_has_repetition,f_rule_pattern_present,label\n';

rows.forEach(r => {
  csv += `${r.password_sample},${r.f_length},${r.f_char_class_count},${r.f_has_lowercase},${r.f_has_uppercase},${r.f_has_digit},${r.f_has_symbol},${r.f_dictionary_present},${r.f_has_leetspeak},${r.f_numeric_prefix},${r.f_numeric_suffix},${r.f_numeric_infix},${r.f_has_sequence},${r.f_has_repetition},${r.f_rule_pattern_present},${r.label}\n`;
});

fs.writeFileSync('classification_dataset.csv', csv);

console.log('✅ classification_dataset.csv generated successfully!');