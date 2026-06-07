import { writeFileSync, readFileSync } from "fs";
import { basename } from "path";
import { validatePortfolio } from "./validators/portfolio.js";
import { validateRecipe } from "./validators/recipe.js";
import { validateQuiz } from "./validators/quiz.js";

// Helper to parse CLI arguments reliably
function parseArgs() {
    const args = process.argv.slice(2);
    const map = {};
    for (let i = 0; i < args.length; i += 2) {
        if (args[i].startsWith('--') && args[i + 1]) {
            map[args[i].replace('--', '')] = args[i + 1];
        }
    }
    return map;
}

// NEW FEATURE: Detect type automatically if not provided
function detectType(filePath, fileContent) {
    const filename = basename(filePath).toLowerCase();
    
    // 1. Try guessing by filename hints
    if (filename.includes('portfolio')) return 'portfolio';
    if (filename.includes('recipe')) return 'recipe';
    if (filename.includes('quiz')) return 'quiz';

    // 2. Try guessing by structural keywords inside the JSON
    try {
        const parsed = JSON.parse(fileContent);
        if (parsed.questions || parsed.quizTitle) return 'quiz';
        if (parsed.ingredients || parsed.instructions) return 'recipe';
        if (parsed.projects || parsed.experience || parsed.skills) return 'portfolio';
    } catch {
        // Not valid JSON, fallback to manual error later
    }

    return null;
}

async function run() {
    const { type: inputType, path, output } = parseArgs();
    const outPath = output || "./validation-result.json"; // Fallback output path

    try {
        // Fail early if no input path is provided
        if (!path) {
            throw new Error("Missing required argument: --path <file_path>");
        }

        // Read file content once for validation/detection
        const content = readFileSync(path, "utf-8");
        
        // Use provided type, or attempt to auto-detect it
        const type = inputType || detectType(path, content);

        if (!type) {
            throw new Error("Could not automatically determine validation type. Please specify --type.");
        }

        let result;
        switch (type.toLowerCase()) {
            case 'portfolio':
                result = await validatePortfolio(content); // Pass content or path depending on your validator setup
                break;
            case 'recipe':
                result = await validateRecipe(content);
                break;
            case 'quiz':
                result = await validateQuiz(content);
                break;
            default:
                throw new Error(`Unsupported validation type: "${type}". Supported types: portfolio, recipe, quiz.`);
        }

        // Safe write on success
        writeFileSync(outPath, JSON.stringify({ status: "success", type, ...result }, null, 2));
        console.log(`✅ Validation successful! Result saved to ${outPath}`);

    } catch (err) {
        // Safe write on error
        writeFileSync(outPath, JSON.stringify({ status: "error", msg: err.message }, null, 2));
        console.error(`❌ Validation failed: ${err.message}`);
    }
}

run();
