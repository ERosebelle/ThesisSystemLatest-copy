const express = require('express');
const cors = require('cors');
const fs = require('fs');
const csv = require('csv-parser');
const { DecisionTreeClassifier } = require("ml-cart");
const path = require('path');
const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Password Vulnerability Backend is running successfully!');
});

// ===== LOAD ML MODEL =====
const model = JSON.parse(fs.readFileSync(path.join(__dirname, "model.json")));

const classifier = DecisionTreeClassifier.load(model);
console.log("✅ ML model loaded");

// ===== LOAD RISK MODEL =====
let riskModel = null;
let riskClassifier = null;
try {
    riskModel = JSON.parse(fs.readFileSync(path.join(__dirname, "risk_model.json")));
    riskClassifier = DecisionTreeClassifier.load(riskModel);
    console.log("✅ Risk model loaded");
} catch (err) {
    console.log("⚠️ risk_model.json not found - run create_risk_dataset.js then train_risk_model.js to generate it. Risk level will be unavailable until then.");
}

// ===== LOAD RECOMMENDATION MODEL =====
let recommendationModel = null;
let recommendationClassifier = null;
try {
    recommendationModel = JSON.parse(
        fs.readFileSync(path.join(__dirname, "recommendation_model.json"))
    );
    recommendationClassifier = DecisionTreeClassifier.load(recommendationModel);
    console.log("✅ Recommendation model loaded");
} catch (err) {
    console.log("⚠️ recommendation_model.json not found - run create_recommendation_dataset.js then train_recommendation_model.js to generate it. Recommendations will fall back to a simple message until then.");
}

// ===== LOAD DATASET =====
let trainingDataset = [];
const datasetPath = path.join(__dirname, 'dataset.csv');

// ===== LOAD DICTIONARIES =====
let englishSet = new Set();
let tagalogSet = new Set();

try {
    const engData = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, 'words_dictionary.json'),
            'utf-8'
        )
    );

    englishSet = new Set(
        Object.keys(engData).map(word => word.toLowerCase())
    );

    console.log(
        `✅ English dictionary loaded: ${englishSet.size} words`
    );

} catch (err) {
    console.log("❌ Failed to load English dictionary");
}

try {
    const tagData = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, 'tagalog_dictionary.json'),
            'utf-8'
        )
    );

    tagalogSet = new Set(
        tagData.map(entry => entry.word.toLowerCase())
    );

    console.log(
        `✅ Tagalog dictionary loaded: ${tagalogSet.size} words`
    );

} catch (err) {
    console.log("❌ Failed to load Tagalog dictionary");
}

// ===== PASSPHRASE WORD POOL =====
const passphraseWordPool = Array.from(englishSet).filter(
    word => word.length >= 4 && word.length <= 7 && /^[a-z]+$/.test(word)
);
if (passphraseWordPool.length === 0) {
    console.log("⚠️ Passphrase word pool is empty - suggestPassphrase() will fall back to generic words.");
}

// ===== LOAD CSV DATASET =====
fs.createReadStream(datasetPath)
    .pipe(csv())
    .on('data', (row) => trainingDataset.push(row))
    .on('end', () => {
        console.log(
            `✅ Dataset loaded: ${trainingDataset.length} samples ready for reference.`
        );
    })
    .on('error', () => {
        console.error("❌ Warning: dataset.csv not found.");
    });

// Expanded Leet Normalization
function normalizeLeet(str) {
    return str.toLowerCase()
        .replace(/[@4]/g, 'a')
        .replace(/0/g, 'o')
        .replace(/[\$5]/g, 's')
        .replace(/3/g, 'e')
        .replace(/[1!|]/g, 'i')
        .replace(/[\(\[\<]/g, 'c')
        .replace(/[7\+]/g, 't')
        .replace(/8/g, 'b');
}

// Dynamic Sequence Detector
function checkSequence(str) {
    const s = str.toLowerCase();
    if (s.length < 3) return 0;

    for (let i = 0; i < s.length - 2; i++) {
        const c1 = s.charCodeAt(i);
        const c2 = s.charCodeAt(i + 1);
        const c3 = s.charCodeAt(i + 2);

        const isDigit = (c) => c >= 48 && c <= 57;
        const isAlpha = (c) => c >= 97 && c <= 122;

        if ((isDigit(c1) && isDigit(c2) && isDigit(c3)) || (isAlpha(c1) && isAlpha(c2) && isAlpha(c3))) {
            if ((c2 === c1 + 1 && c3 === c2 + 1) || (c2 === c1 - 1 && c3 === c2 - 1)) {
                return 1;
            }
        }
    }
    return 0;
}

// ===== 1. FEATURE EXTRACTION =====
function extractFeatures(password) {
    const originalPassword = password;

    const numericPrefix = /^\d+/.test(originalPassword) ? 1 : 0;
    const numericSuffix = /\d+$/.test(originalPassword) ? 1 : 0;
    const middlePart = originalPassword.replace(/^\d+/, '').replace(/\d+$/, '');
    const numericInfix = /\d+/.test(middlePart) ? 1 : 0;

    const camelSplit = originalPassword.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
    const leetNormalized = normalizeLeet(camelSplit);
    const alphaTokens = leetNormalized.split(/[^a-z]+/).filter(Boolean);

    let dictionaryDetected = 0;
    let matchedWords = [];
    let totalMatchedLength = 0;
    let longestMatch = "";

    for (const token of alphaTokens) {
        if (token.length < 3) continue;

        if (englishSet.has(token) || tagalogSet.has(token)) {
            matchedWords.push(token);
            totalMatchedLength += token.length;
            if (token.length > longestMatch.length) longestMatch = token;
            continue;
        }

        let longestSub = "";
        for (let i = 0; i < token.length; i++) {
            for (let j = i + 3; j <= token.length; j++) {
                const sub = token.slice(i, j);
                if ((englishSet.has(sub) || tagalogSet.has(sub)) && sub.length > longestSub.length) {
                    longestSub = sub;
                }
            }
        }

        if (longestSub.length >= 3) {
            matchedWords.push(longestSub);
            totalMatchedLength += longestSub.length;
            if (longestSub.length > longestMatch.length) longestMatch = longestSub;
        }
    }

    const coverageRatio = originalPassword.length > 0 ? (totalMatchedLength / originalPassword.length) : 0;
    if (matchedWords.length > 0 && (coverageRatio >= 0.30 || totalMatchedLength >= 4)) {
        dictionaryDetected = 1;
    }

    const strippedMiddle = originalPassword.replace(/^\d+/, '').replace(/\d+$/, '');
    const hasEmbeddedLeet = /([a-zA-Z][@$40531!\(\[\<+]|[a-zA-Z0-9][@$!\(\[\<+][a-zA-Z0-9]|[@$40531!\(\[\<+][a-zA-Z])/.test(strippedMiddle);

    const rawTokens = camelSplit.toLowerCase().split(/[^a-z]+/).filter(Boolean);
    const rawMatched = rawTokens.some(t => englishSet.has(t) || tagalogSet.has(t));

    const hasLeetspeak = dictionaryDetected && (hasEmbeddedLeet || (!rawMatched && /[@$40531!\(\[\<+]/.test(strippedMiddle))) ? 1 : 0;

    const allRawTokensExact = rawTokens.length > 0 && rawTokens.every(t => englishSet.has(t) || tagalogSet.has(t));
    const isExactDictionary = allRawTokensExact && !/\d/.test(originalPassword) && !/[^A-Za-z0-9]/.test(originalPassword) && !hasLeetspeak;

    const extractedFeatures = {
        length: originalPassword.length,
        has_lowercase: /[a-z]/.test(originalPassword) ? 1 : 0,
        has_uppercase: /[A-Z]/.test(originalPassword) ? 1 : 0,
        has_digit: /\d/.test(originalPassword) ? 1 : 0,
        has_symbol: /[^A-Za-z0-9]/.test(originalPassword) ? 1 : 0,
        dictionary_present: dictionaryDetected,
        has_leetspeak: hasLeetspeak,
        numeric_prefix: numericPrefix,
        numeric_suffix: numericSuffix,
        numeric_infix: numericInfix,
        has_sequence: checkSequence(originalPassword),
        has_repetition: /(.)\1|(.{2,})\2+/i.test(originalPassword) ? 1 : 0,
        _matched_dictionary_word: dictionaryDetected ? matchedWords.join(", ") : "",
        _is_exact_dictionary: isExactDictionary ? 1 : 0
    };

    extractedFeatures.character_class_count =
        extractedFeatures.has_lowercase +
        extractedFeatures.has_uppercase +
        extractedFeatures.has_digit +
        extractedFeatures.has_symbol;

    extractedFeatures.rule_pattern_present = (
        extractedFeatures.has_sequence ||
        extractedFeatures.has_repetition ||
        extractedFeatures.numeric_prefix ||
        extractedFeatures.numeric_suffix ||
        extractedFeatures.numeric_infix ||
        (extractedFeatures.has_leetspeak && extractedFeatures.dictionary_present)
    ) ? 1 : 0;

    return extractedFeatures;
}

// ===== PASSWORD COMPARISON & CLASSIFICATION HELPERS =====
function calculateSecurityScore(features) {
    let score = 0;
    score += features.length * 2;
    score += features.character_class_count * 8;
    if (features.dictionary_present) score -= 20;
    if (features.has_leetspeak) score -= 5;
    if (features.rule_pattern_present) score -= 15;
    if (features.has_sequence) score -= 10;
    if (features.has_repetition) score -= 10;
    return score;
}

function comparePasswords(currentFeatures, previousFeatures, currentRiskLevel, previousRiskLevel) {
    const riskRank = { "CRITICAL": 0, "HIGH": 1, "MODERATE": 2 };
    const scoreCurrent = calculateSecurityScore(currentFeatures);
    const scorePrevious = calculateSecurityScore(previousFeatures);

    if (riskRank[currentRiskLevel] > riskRank[previousRiskLevel]) {
        return { status: "CURRENT_PREFERRED", current_score: scoreCurrent, previous_score: scorePrevious, message: "Your current password has a safer ML risk classification compared to your previous password." };
    }
    if (riskRank[currentRiskLevel] < riskRank[previousRiskLevel]) {
        return { status: "PREVIOUS_PREFERRED", current_score: scoreCurrent, previous_score: scorePrevious, message: "Your previous password has a safer ML risk classification compared to your current password." };
    }
    if (scoreCurrent > scorePrevious) {
        return { status: "CURRENT_PREFERRED", current_score: scoreCurrent, previous_score: scorePrevious, message: "Your current password has favorable security characteristics compared to your previous password." };
    }
    if (scorePrevious > scoreCurrent) {
        return { status: "PREVIOUS_PREFERRED", current_score: scoreCurrent, previous_score: scorePrevious, message: "Your previous password has favorable security characteristics compared to your current password." };
    }
    return { status: "SIMILAR", current_score: scoreCurrent, previous_score: scorePrevious, message: "Your current and previous passwords have similar security characteristics." };
}

function classifyPassword(extractedFeatures) {
    const modelFeatures = [[
        extractedFeatures.length, extractedFeatures.character_class_count, extractedFeatures.has_lowercase,
        extractedFeatures.has_uppercase, extractedFeatures.has_digit, extractedFeatures.has_symbol,
        extractedFeatures.dictionary_present, extractedFeatures.has_leetspeak, extractedFeatures.numeric_prefix,
        extractedFeatures.numeric_suffix, extractedFeatures.numeric_infix, extractedFeatures.has_sequence,
        extractedFeatures.has_repetition, extractedFeatures.rule_pattern_present
    ]];

    const prediction = classifier.predict(modelFeatures);
    const labelMap = { 0: "DICTIONARY", 1: "RULE-BASED", 2: "BRUTE-FORCE" };
    let finalLabel = labelMap[prediction[0]];

    if (extractedFeatures._is_exact_dictionary === 1) {
        finalLabel = "DICTIONARY";
    } else if (extractedFeatures.dictionary_present === 1 && extractedFeatures.rule_pattern_present === 0) {
        finalLabel = "DICTIONARY";
    }

    return { label: finalLabel, path: ["Your password has been analyzed based on its structure and patterns", `Prediction: ${finalLabel}`] };
}

function classifyRisk(extractedFeatures) {
    if (!riskClassifier) return "MODERATE";
    const modelFeatures = [[
        extractedFeatures.length, extractedFeatures.character_class_count, extractedFeatures.has_lowercase,
        extractedFeatures.has_uppercase, extractedFeatures.has_digit, extractedFeatures.has_symbol,
        extractedFeatures.dictionary_present, extractedFeatures.has_leetspeak, extractedFeatures.numeric_prefix,
        extractedFeatures.numeric_suffix, extractedFeatures.numeric_infix, extractedFeatures.has_sequence,
        extractedFeatures.has_repetition, extractedFeatures.rule_pattern_present
    ]];
    const rawPrediction = riskClassifier.predict(modelFeatures);
    const predictedIndex = Number(rawPrediction[0]);
    const riskMap = { 0: "CRITICAL", 1: "HIGH", 2: "MODERATE" };
    return riskMap[predictedIndex] || "MODERATE";
}

function classifyRecommendation(extractedFeatures) {
    if (!recommendationClassifier) return { label: null, steps: [] };
    const modelFeatures = [[
        extractedFeatures.length, extractedFeatures.character_class_count, extractedFeatures.has_lowercase,
        extractedFeatures.has_uppercase, extractedFeatures.has_digit, extractedFeatures.has_symbol,
        extractedFeatures.dictionary_present, extractedFeatures.has_leetspeak, extractedFeatures.numeric_prefix,
        extractedFeatures.numeric_suffix, extractedFeatures.numeric_infix, extractedFeatures.has_sequence,
        extractedFeatures.has_repetition, extractedFeatures.rule_pattern_present
    ]];
    const prediction = recommendationClassifier.predict(modelFeatures);
    const recommendationLabelMap = { 0: "AVOID_DICTIONARY_WORDS", 1: "AVOID_PREDICTABLE_PATTERNS", 2: "ADD_CHARACTER_VARIETY", 3: "INCREASE_LENGTH", 4: "INCREASE_LENGTH" };
    const label = recommendationLabelMap[prediction[0]] || null;
    const steps = [];
    return { label, steps };
}

function explainRisk(features, level, treeRoot, vulnerabilityType) {
    const contributions = [];
    contributions.push(`+${features.length} points from password length (${features.length} characters).`);
    contributions.push(`+${features.character_class_count * 10} points from using ${features.character_class_count} character class(es).`);
    if (features.dictionary_present) contributions.push("-20 points: a dictionary word was detected.");
    if (features.rule_pattern_present) contributions.push("-15 points: a predictable rule-based pattern was detected.");
    
    const score = calculateSecurityScore(features);
    return { risk_level: level, security_score: score, summary: "Risk assessed based on feature criteria.", model_decision_steps: [], contributing_factors: contributions };
}

function getStrategies(vulnerabilityType, extractedFeatures, password, treeRoot, classificationRationale, recommendationResult) {
    let tips = ["Consider enabling Multi-Factor Authentication (MFA)."];
    return { tips, technicalBreakdown: { vulnerability_explanation: classificationRationale || "", attack_vector: "Analysis complete.", remediation: "Improve complexity." } };
}

const FEATURE_LABELS = {
    length: "Length", has_lowercase: "Has Lowercase", has_uppercase: "Has Uppercase", has_digit: "Has Digit", has_symbol: "Has Symbol",
    dictionary_present: "Dictionary Present", has_leetspeak: "Has Leetspeak", numeric_prefix: "Numeric Prefix", numeric_suffix: "Numeric Suffix",
    numeric_infix: "Numeric Substring / Infix", has_sequence: "Has Sequence", has_repetition: "Has Repetition", character_class_count: "Character Class Count", rule_pattern_present: "Rule Pattern Present"
};

const FEATURE_COLUMNS = [
    { key: "length", question: (t) => `Length >= ${Math.round(t)}?`, explain: { YES: "Valid length", NO: "Too short" } },
    { key: "character_class_count", question: (t) => `Character Class Count >= ${Math.round(t)}?`, explain: { YES: "Sufficient variety", NO: "Low variety" } },
    { key: "has_lowercase", question: () => "Lowercase Letters", explain: { YES: "Yes", NO: "No" } },
    { key: "has_uppercase", question: () => "Uppercase Letters", explain: { YES: "Yes", NO: "No" } },
    { key: "has_digit", question: () => "Digits", explain: { YES: "Yes", NO: "No" } },
    { key: "has_symbol", question: () => "Symbols", explain: { YES: "Yes", NO: "No" } },
    { key: "dictionary_present", question: () => "Dictionary Word", explain: { YES: "Yes", NO: "No" } },
    { key: "has_leetspeak", question: () => "Leetspeak", explain: { YES: "Yes", NO: "No" } },
    { key: "numeric_prefix", question: () => "Numeric Prefix", explain: { YES: "Yes", NO: "No" } },
    { key: "numeric_suffix", question: () => "Numeric Suffix", explain: { YES: "Yes", NO: "No" } },
    { key: "numeric_infix", question: () => "Numeric Infix", explain: { YES: "Yes", NO: "No" } },
    { key: "has_sequence", question: () => "Sequential Pattern", explain: { YES: "Yes", NO: "No" } },
    { key: "has_repetition", question: () => "Repetition Pattern", explain: { YES: "Yes", NO: "No" } },
    { key: "rule_pattern_present", question: () => "Rule-Based Pattern", explain: { YES: "Yes", NO: "No" } }
];

const DECISION_TREE_ORDER = [
    "dictionary_present", "has_leetspeak", "numeric_prefix", "numeric_suffix", "numeric_infix",
    "has_sequence", "has_repetition", "has_lowercase", "has_uppercase", "has_digit", "has_symbol",
    "character_class_count", "length", "rule_pattern_present"
];

function buildManualDecisionPath(extractedFeatures, finalLabel) {
    return { name: finalLabel, type: "result", final: true, result: finalLabel, on_path: true };
}

function explainClassification(extractedFeatures, vulnerabilityType) {
    return { feature_checklist: [], classification_rationale: `Classified as ${vulnerabilityType}.` };
}

// ===== API ROUTE =====
app.post('/analyze', (req, res) => {
    const { password, previousPassword } = req.body;

    if (!password) {
        return res.status(400).json({ error: "Password is required" });
    }

    const extractedFeatures = extractFeatures(password);
    const currentRiskLevel = classifyRisk(extractedFeatures);

    let comparisonResult = null;
    if (previousPassword) {
        const previousFeatures = extractFeatures(previousPassword);
        const previousRiskLevel = classifyRisk(previousFeatures);
        comparisonResult = comparePasswords(extractedFeatures, previousFeatures, currentRiskLevel, previousRiskLevel);
    }

    const classificationResult = classifyPassword(extractedFeatures);
    const riskExplanation = explainRisk(extractedFeatures, currentRiskLevel, null, classificationResult.label);
    const recommendationResult = classifyRecommendation(extractedFeatures);
    const fullClassificationExplanation = explainClassification(extractedFeatures, classificationResult.label);

    const { tips, technicalBreakdown } = getStrategies(
        classificationResult.label,
        extractedFeatures,
        password,
        null,
        fullClassificationExplanation.classification_rationale,
        recommendationResult
    );

    const actualModelDecisionPath = buildManualDecisionPath(extractedFeatures, classificationResult.label);
    const entropyBits = Math.round(password.length * Math.log2(extractedFeatures.character_class_count * 22 || 26));

    res.json({
        password: password,
        vulnerability: classificationResult.label,
        decision_path: classificationResult.path,
        features: extractedFeatures,
        password_comparison: comparisonResult,
        actual_model_decision_path: actualModelDecisionPath,
        analytics_breakdown: {
            password_length: extractedFeatures.length,
            character_classes_used: extractedFeatures.character_class_count,
            estimated_entropy_bits: entropyBits,
            dictionary_found: extractedFeatures.dictionary_present === 1 ? "Yes" : "No",
            rule_pattern_active: extractedFeatures.rule_pattern_present === 1 ? "Yes" : "No"
        },
        risk_level: currentRiskLevel,
        risk_assessment: riskExplanation,
        recommendation_label: recommendationResult.label,
        classification_explanation: fullClassificationExplanation,
        security_assessment: technicalBreakdown,
        strategies: tips,
        dataset_count: trainingDataset.length
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 ML Backend running on port ${PORT}`);
});