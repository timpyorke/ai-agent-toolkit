#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');

const SKILLS_DIR = path.join(__dirname, '..', 'skills');
const CATEGORIES_PATH = path.join(SKILLS_DIR, '_categories.json');

// Helper functions
function getSkills() {
    const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
    return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .sort();
}

function getSkillInfo(skillName) {
    const skillPath = path.join(SKILLS_DIR, skillName, 'SKILL.md');
    if (!fs.existsSync(skillPath)) {
        return null;
    }

    const content = fs.readFileSync(skillPath, 'utf-8');
    const lines = content.split('\n');

    let name = skillName;
    let description = '';

    // Parse frontmatter
    if (lines[0] === '---') {
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (line === '---') break;

            if (line.startsWith('name:')) {
                name = line.substring(5).trim();
            } else if (line.startsWith('description:')) {
                description = line.substring(12).trim();
            }
        }
    }

    return { name, description, path: skillPath };
}

function formatSkillList(skills) {
    console.log(chalk.bold.cyan('\n📚 Available Skills:\n'));

    skills.forEach(skill => {
        const info = getSkillInfo(skill);
        if (info) {
            console.log(chalk.green(`  • ${info.name}`));
            if (info.description) {
                console.log(chalk.gray(`    ${info.description}`));
            }
        } else {
            console.log(chalk.yellow(`  • ${skill}`));
            console.log(chalk.gray(`    (No SKILL.md found)`));
        }
        console.log();
    });
}

function loadCategories() {
    if (!fs.existsSync(CATEGORIES_PATH)) return null;
    try {
        const raw = fs.readFileSync(CATEGORIES_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch (e) {
        console.error(chalk.red('Error reading _categories.json:'), e.message);
        return null;
    }
}

function formatGroupedSkillList(skills) {
    const categories = loadCategories();
    if (!categories) {
        formatSkillList(skills);
        return;
    }

    console.log(chalk.bold.cyan('\n📚 Available Skills (Grouped):\n'));
    let total = 0;

    for (const [category, members] of Object.entries(categories)) {
        const existing = members.filter(m => skills.includes(m));
        if (!existing.length) continue;

        console.log(chalk.bold.yellow(`▶ ${category} (${existing.length})`));
        existing.forEach(skill => {
            const info = getSkillInfo(skill);
            if (info) {
                console.log(chalk.green(`  • ${info.name}`));
                if (info.description) {
                    console.log(chalk.gray(`    ${info.description}`));
                }
            } else {
                console.log(chalk.yellow(`  • ${skill}`));
                console.log(chalk.gray(`    (No SKILL.md found)`));
            }
        });
        console.log();
        total += existing.length;
    }

    const listed = new Set(Object.values(categories).flat());
    const unlisted = skills.filter(s => !listed.has(s));
    if (unlisted.length) {
        console.log(chalk.bold.yellow(`▶ Uncategorized (${unlisted.length})`));
        unlisted.forEach(skill => console.log(chalk.green(`  • ${skill}`)));
        console.log();
        total += unlisted.length;
    }

    console.log(chalk.gray(`Total: ${total} skills\n`));
}

function showSkillPreview(skillName) {
    const info = getSkillInfo(skillName);
    if (!info) {
        console.log(chalk.red(`❌ Skill "${skillName}" not found`));
        return;
    }

    console.log(chalk.bold.cyan(`\n📖 ${info.name}\n`));
    console.log(chalk.gray(info.description));
    console.log(chalk.gray(`\nLocation: ${info.path}\n`));

    // Show first 30 lines of content
    const content = fs.readFileSync(info.path, 'utf-8');
    const lines = content.split('\n');
    const previewLines = lines.slice(0, 30);

    console.log(chalk.white(previewLines.join('\n')));

    if (lines.length > 30) {
        console.log(chalk.gray(`\n... (${lines.length - 30} more lines)`));
    }
}

// Commands
program
    .name('aat')
    .description('AI Agent Toolkit - Manage and deploy AI agent skills')
    .version('0.1.0');

program
    .command('list')
    .description('List all available skills')
    .option('-g, --group', 'Group skills by category')
    .action((opts) => {
        try {
            const skills = getSkills();
            if (opts.group || fs.existsSync(CATEGORIES_PATH)) {
                formatGroupedSkillList(skills);
            } else {
                formatSkillList(skills);
                console.log(chalk.gray(`Total: ${skills.length} skills\n`));
            }
        } catch (error) {
            console.error(chalk.red('Error listing skills:'), error.message);
            process.exit(1);
        }
    });

program
    .command('info <skill>')
    .description('Show detailed information about a skill')
    .action((skill) => {
        try {
            showSkillPreview(skill);
        } catch (error) {
            console.error(chalk.red('Error showing skill info:'), error.message);
            process.exit(1);
        }
    });

program
    .command('copy')
    .description('Copy skills to user or project scope')
    .option('-d, --dest <path>', 'Destination directory')
    .option('-a, --all', 'Copy all skills')
    .option('-s, --skills <skills...>', 'Specific skills to copy')
    .action(async (options) => {
        try {
            let skillsToCopy = [];

            if (options.all) {
                skillsToCopy = getSkills();
            } else if (options.skills) {
                skillsToCopy = options.skills;
            } else {
                // Interactive selection
                const skills = getSkills();
                const categories = (typeof loadCategories === 'function') ? loadCategories() : null;

                // Build grouped choices with separators when categories exist
                let choices = [];
                if (categories) {
                    for (const [category, members] of Object.entries(categories)) {
                        const existing = members.filter(m => skills.includes(m));
                        if (!existing.length) continue;

                        choices.push(new inquirer.Separator(`── ${category} ──`));
                        for (const skill of existing) {
                            const info = getSkillInfo(skill);
                            choices.push({
                                name: info ? `${info.name}${info.description ? ' - ' + info.description : ''}` : skill,
                                value: skill,
                                short: info ? info.name : skill,
                            });
                        }
                    }

                    // Add uncategorized skills
                    const listed = new Set(Object.values(categories).flat());
                    const unlisted = skills.filter(s => !listed.has(s));
                    if (unlisted.length) {
                        choices.push(new inquirer.Separator('── Uncategorized ──'));
                        for (const skill of unlisted) {
                            const info = getSkillInfo(skill);
                            choices.push({
                                name: info ? `${info.name}${info.description ? ' - ' + info.description : ''}` : skill,
                                value: skill,
                                short: info ? info.name : skill,
                            });
                        }
                    }
                } else {
                    // Flat choices fallback
                    choices = skills.map(skill => {
                        const info = getSkillInfo(skill);
                        return {
                            name: info ? `${info.name}${info.description ? ' - ' + info.description : ''}` : skill,
                            value: skill,
                            short: info ? info.name : skill,
                        };
                    });
                }

                console.log(chalk.gray('\nUse Space to select, Enter to confirm. Press "a" to toggle all, "i" to invert selection.'));
                const answers = await inquirer.prompt([
                    {
                        type: 'checkbox',
                        name: 'skills',
                        message: 'Select skills to copy:',
                        choices,
                        pageSize: 20,
                        validate: (input) => (input && input.length > 0) ? true : 'Select at least one skill',
                    },
                ]);

                skillsToCopy = answers.skills;
                console.log(chalk.cyan(`\nSelected: ${skillsToCopy.length} skill(s)`));
                const proceed = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'confirm',
                        message: 'Proceed to copy selected skills?',
                        default: true,
                    },
                ]);
                if (!proceed.confirm) {
                    console.log(chalk.yellow('Copy cancelled'));
                    return;
                }
            }

            if (skillsToCopy.length === 0) {
                console.log(chalk.yellow('No skills selected'));
                return;
            }

            let destDir = options.dest;
            if (!destDir) {
                const destAnswers = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'scope',
                        message: 'Choose installation scope:',
                        choices: [
                            { name: 'User scope (~/.claude/skills/)', value: 'user' },
                            { name: 'Project scope (./.claude/skills/)', value: 'project' },
                            { name: 'Custom path', value: 'custom' },
                        ],
                    },
                ]);

                if (destAnswers.scope === 'user') {
                    destDir = path.join(require('os').homedir(), '.claude', 'skills');
                } else if (destAnswers.scope === 'project') {
                    destDir = path.join(process.cwd(), '.claude', 'skills');
                } else {
                    const pathAnswers = await inquirer.prompt([
                        {
                            type: 'input',
                            name: 'path',
                            message: 'Enter destination path:',
                            default: process.cwd(),
                        },
                    ]);
                    destDir = pathAnswers.path;
                }
            }

            // Create destination directory
            await fs.ensureDir(destDir);

            console.log(chalk.cyan(`\n📦 Copying ${skillsToCopy.length} skill(s) to ${destDir}...\n`));

            let successCount = 0;
            let errorCount = 0;

            for (const skill of skillsToCopy) {
                const srcPath = path.join(SKILLS_DIR, skill);
                const destPath = path.join(destDir, skill);

                try {
                    await fs.copy(srcPath, destPath, { overwrite: true });
                    console.log(chalk.green(`  ✓ ${skill}`));
                    successCount++;
                } catch (error) {
                    console.log(chalk.red(`  ✗ ${skill}: ${error.message}`));
                    errorCount++;
                }
            }

            console.log();
            console.log(chalk.bold(`Summary: ${chalk.green(successCount)} succeeded, ${chalk.red(errorCount)} failed`));
            console.log(chalk.gray(`\nSkills copied to: ${destDir}\n`));

        } catch (error) {
            console.error(chalk.red('Error copying skills:'), error.message);
            process.exit(1);
        }
    });

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
