const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ] 
});

// 🎨 Tema Warna Gradient
const gradientColors = ['#9B59B6', '#8A2BE2', '#C71585', '#4B0082', '#7B68EE', '#DDA0DD'];
const getRandomColor = () => gradientColors[Math.floor(Math.random() * gradientColors.length)];

// 📦 Settings Maps & RPG Data
const serverSettings = new Map();
const userSettings = new Map();
const activeTimers = new Map();
const rpgPlayers = new Map(); 

function getServerConfig(guildId) {
    if (!serverSettings.has(guildId)) {
        serverSettings.set(guildId, {
            botPrefix: "!",
            owoPrefix: "w",
            useDefaultPrefix: true,
            owoMsg: "owo 🥳",
            huntMsg: "hunt 🎉",
            godMsg: "god hunt ⚡",
            prayMsg: "pray/curse 🙏",
            voteMsg: "🗳️ Waktunya vote OwO bot! Yuk vote sekarang biar dapet reward!"
        });
    }
    return serverSettings.get(guildId);
}

function getUserConfig(userId) {
    if (!userSettings.has(userId)) {
        userSettings.set(userId, {
            huntEnabled: true,
            godEnabled: true,
            prayEnabled: true,
            owoEnabled: true,
            voteEnabled: true,
            pingsEnabled: true,
            replyEnabled: true,
            owoMode: 'text',
            huntMode: 'text',
            godMode: 'text',
            prayMode: 'text',
            voteMode: 'text',
            owoGif: "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif",
            huntGif: "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif",
            godGif: "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif",
            prayGif: "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif",
            voteGif: "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif"
        });
    }
    return userSettings.get(userId);
}

function getRpgPlayer(userId, username = "Hero") {
    if (!rpgPlayers.has(userId)) {
        // Karakter utama lu diset [L] Legendary otomatis!
        const mainHero = { name: `${username} (Leader)`, class: 'Legendary Hero', tier: 'Legendary', tierBadge: '[L]', atkBonus: 25, defBonus: 15 };
        rpgPlayers.set(userId, {
            name: username,
            hp: 100,
            maxHp: 100,
            atk: 15,
            def: 5,
            floor: 1,
            inventory: [],
            equipped: { weapon: null, armor: null, helmet: null },
            party: [mainHero], 
            roster: [mainHero] 
        });
    }
    return rpgPlayers.get(userId);
}

client.on('ready', () => {
    console.log(`✅ Bot ${client.user.tag} aktif & siap!`);
});

// --- 🎨 EMBED HELP & SETTINGS ---
function createHelpEmbed(guildName, avatarURL, prefix) {
    return new EmbedBuilder()
        .setColor(getRandomColor())
        .setAuthor({ name: '🏓 Reminders & Dungeon RPG Menu', iconURL: client.user.displayAvatarURL() })
        .setDescription(
            `Gunakan \`${prefix} help\` untuk melihat bantuan.\n\n` +
            `**🎮 GAME REMINDERS & AUTOHUNT (WHB/GHB)**\n` +
            `\`${prefix} owo\` | \`${prefix} owoh\` | \`${prefix} godh\` | \`${prefix} owopray\` | \`${prefix} owovote\`\n` +
            `*(Ketik \`whb 1\` atau \`ghb 1\` untuk baca timer auto hunt OwO otomatis via DM)*\n\n` +
            `**⚔️ DUNGEON RPG & COMPANION ZOO**\n` +
            `\`${prefix} dungeon\` (atau \`${prefix} dg\`) : Masuk dungeon, lawan monster, & cari companion\n` +
            `\`${prefix} inv\` : Cek status total, gear, & inventory ([L]/[E]/[R]/[U]/[C])\n` +
            `\`${prefix} equip <no>\` : Pakai item dari inventory\n` +
            `\`${prefix} party\` : Kelola tim aktif (Maksimal 3 orang)\n` +
            `\`${prefix} zoo\` : Koleksi companion yang ditemui di dungeon\n\n` +
            `**🛠️ UTILITY COMMANDS**\n` +
            `\`${prefix} ping\` | \`${prefix} clear\` | \`${prefix} user\` | \`${prefix} uptime\` | \`${prefix} server\` | \`${prefix} avatar\``
        )
        .setFooter({ text: `Server ${guildName || 'OPPAI'}`, iconURL: avatarURL || client.user.displayAvatarURL() });
}

function createHelpButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('help_reminders').setLabel('Reminders').setEmoji('🏓').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('help_utility').setLabel('Utilitas').setEmoji('🛠️').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('help_settings').setLabel('Settings').setEmoji('⚙️').setStyle(ButtonStyle.Secondary)
    );
}

function createServerSettingsEmbed(guildId) {
    const config = getServerConfig(guildId);
    return new EmbedBuilder()
        .setColor(getRandomColor())
        .setTitle('Server Settings')
        .setDescription(
            `⚙️ **OwO prefix:** \`${config.owoPrefix}\`\n` +
            `🤖 **Bot prefix:** \`${config.botPrefix}\` (\`${config.botPrefix} s prefix <baru>\`)\n\n` +
            `🌱 **owo:** \`${config.botPrefix} s owo <pesan>\`\n` +
            `🏹 **hunt:** \`${config.botPrefix} s hunt <pesan>\`\n` +
            `⚡ **god hunt:** \`${config.botPrefix} s godh <pesan>\`\n` +
            `☘️ **pray/curse:** \`${config.botPrefix} s pray <pesan>\`\n` +
            `🗳️ **vote:** \`${config.botPrefix} s vote <pesan>\``
        );
}

function createSettingsEmbed(user, type) {
    const config = getUserConfig(user.id);
    const keyMap = { owoh: 'huntEnabled', godh: 'godEnabled', owo: 'owoEnabled', owopray: 'prayEnabled', owovote: 'voteEnabled' };
    const modeMap = { owoh: 'huntMode', godh: 'godMode', owo: 'owoMode', owopray: 'prayMode', owovote: 'voteMode' };
    const isEnabled = config[keyMap[type]];
    const currentMode = config[modeMap[type]];

    return new EmbedBuilder()
        .setColor(isEnabled ? getRandomColor() : '#F04747')
        .setAuthor({ name: `${user.username}'s ${type} settings`, iconURL: user.displayAvatarURL() })
        .setDescription(
            `${isEnabled ? '✅' : '❌'} **Reminder Enabled?**\n` +
            `${config.pingsEnabled ? '✅' : '❌'} **Pings Enabled?**\n` +
            `${config.replyEnabled ? '✅' : '❌'} **Inline Reply?**\n` +
            `💬 **Mode:** \`${currentMode?.toUpperCase() || 'TEXT'}\``
        );
}

function createSettingsButtons(user, type) {
    const config = getUserConfig(user.id);
    const keyMap = { owoh: 'huntEnabled', godh: 'godEnabled', owo: 'owoEnabled', owopray: 'prayEnabled', owovote: 'voteEnabled' };
    const modeMap = { owoh: 'huntMode', godh: 'godMode', owo: 'owoMode', owopray: 'prayMode', owovote: 'voteMode' };
    const isEnabled = config[keyMap[type]];

    return [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`toggle_enable_${type}_${user.id}`).setLabel(type).setEmoji('⚔️').setStyle(isEnabled ? ButtonStyle.Success : ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`toggle_ping_${type}_${user.id}`).setLabel('ping').setEmoji('🔴').setStyle(config.pingsEnabled ? ButtonStyle.Success : ButtonStyle.Secondary)
        ),
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`toggle_reply_${type}_${user.id}`).setLabel('reply').setEmoji('↩️').setStyle(config.replyEnabled ? ButtonStyle.Success : ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`toggle_mode_${type}_${user.id}`).setLabel(`mode: ${config[modeMap[type]]}`).setEmoji('🖼️').setStyle(ButtonStyle.Primary)
        )
    ];
}

// --- 📩 MESSAGE EVENT HANDLER ---
client.on('messageCreate', async (message) => {
    try {
        const content = message.content.trim();
        const msgUpper = content.toUpperCase();
        const msgLower = content.toLowerCase();
        const userId = message.author.id;
        const guildId = message.guild?.id || 'dm';

        const serverCfg = getServerConfig(guildId);
        const userCfg = getUserConfig(userId);

        // --- 🤖 DETEKSI PESAN DARI BOT (OwO Bot / God Bot) ---
        if (message.author.bot) {
            
            // 1. Deteksi Captcha / Verification
            if (msgLower.includes("captcha") || msgLower.includes("verify")) {
                message.channel.send(`🚨 **PERINGATAN:** Ada Captcha/Verifikasi! Cek sekarang!`).catch(() => {});
            }

            // 2. DETEKSI AUTOHUNT BOT (I WILL BE BACK IN)
            if (msgUpper.includes('I WILL BE BACK IN')) {
                const hoursMatch = msgUpper.match(/(\d+)\s*H/i);
                const minutesMatch = msgUpper.match(/(\d+)\s*M/i);
                const secondsMatch = msgUpper.match(/(\d+)\s*S/i);

                let totalMs = 0;
                let durationParts = [];

                if (hoursMatch) {
                    const h = parseInt(hoursMatch[1]);
                    totalMs += h * 3600000;
                    durationParts.push(`${h} Jam`);
                }
                if (minutesMatch) {
                    const m = parseInt(minutesMatch[1]);
                    totalMs += m * 60000;
                    durationParts.push(`${m} Menit`);
                }
                if (secondsMatch) {
                    const s = parseInt(secondsMatch[1]);
                    totalMs += s * 1000;
                    durationParts.push(`${s} Detik`);
                }

                const durationString = durationParts.join(' ') || 'beberapa saat';

                let targetUser = message.mentions.users.first();
                let huntTypeLabel = "OWO HUNTBOT";

                // A. Cek dari reply pesan
                if (!targetUser && message.reference) {
                    const refMsg = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
                    if (refMsg && !refMsg.author.bot) {
                        targetUser = refMsg.author;
                        if (refMsg.content.toLowerCase().includes('ghb') || refMsg.content.toLowerCase().includes('gah')) huntTypeLabel = "GOD HUNTBOT";
                    }
                }

                // B. Cari pesan user paling akhir sebelum respon OwO bot ini
                if (!targetUser) {
                    const recentMsgs = await message.channel.messages.fetch({ limit: 6 }).catch(() => null);
                    if (recentMsgs) {
                        const huntKeywords = ['hb', 'ghb', 'whb', 'ah', 'w ah', 'autohunt', 'gah'];
                        const lastUserMsg = recentMsgs.find(m => !m.author.bot && huntKeywords.some(kw => m.content.toLowerCase().includes(kw)));
                        
                        if (lastUserMsg) {
                            targetUser = lastUserMsg.author;
                            if (lastUserMsg.content.toLowerCase().includes('ghb') || lastUserMsg.content.toLowerCase().includes('gah')) {
                                huntTypeLabel = "GOD HUNTBOT";
                            }
                        }
                    }
                }

                if (totalMs > 0 && targetUser) {
                    message.channel.send(`⏰ Pengingat **${huntTypeLabel}** dipasang untuk <@${targetUser.id}>!\n⏳ **Sisa waktu:** \`${durationString}\``).catch(() => {});
                    
                    setTimeout(async () => {
                        try {
                            await targetUser.send({
                                content: `🔔 <@${targetUser.id}> **${huntTypeLabel} SELESAI!** Waktunya cek / hunt lagi! ⚔️`,
                                allowedMentions: { users: [targetUser.id] }
                            });
                        } catch (e) {
                            message.channel.send(`🚨 <@${targetUser.id}> **${huntTypeLabel} SELESAI!** (DM kamu tertutup)`).catch(() => {});
                        }
                    }, totalMs);
                }
            }
            return;
        }

        // --- 🛠️ COMMAND HANDLER ---
        let usedPrefix = null;
        if (msgLower.startsWith('!pai')) {
            usedPrefix = '!pai';
        } else if (serverCfg.botPrefix && msgLower.startsWith(serverCfg.botPrefix.toLowerCase())) {
            usedPrefix = serverCfg.botPrefix;
        }

        if (usedPrefix) {
            const args = content.slice(usedPrefix.length).trim().split(/ +/);
            const command = args.shift()?.toLowerCase();

            if (!command || command === 'help') {
                return message.channel.send({ embeds: [createHelpEmbed(message.guild?.name, message.author.displayAvatarURL(), serverCfg.botPrefix)], components: [createHelpButtons()] });
            }
            if (command === 'settings') return message.channel.send({ embeds: [createServerSettingsEmbed(guildId)] });

            // --- ⚙️ SERVER SETTINGS ---
            if (command === 's' || command === 'set') {
                const subCmd = args.shift()?.toLowerCase();
                const newMsg = args.join(" ");

                if (subCmd === 'prefix') {
                    if (!args[0]) return message.channel.send(`❌ Masukkan prefix baru! Contoh: \`${usedPrefix} s prefix .\``);
                    serverCfg.botPrefix = args[0];
                    return message.channel.send(`✅ Bot prefix berhasil diubah menjadi \`${serverCfg.botPrefix}\``);
                }
                if (subCmd === 'owoprefix') {
                    if (!args[0]) return message.channel.send(`❌ Masukkan owo prefix baru! Contoh: \`${usedPrefix} s owoprefix w\``);
                    serverCfg.owoPrefix = args[0];
                    return message.channel.send(`✅ OwO prefix berhasil diubah menjadi \`${serverCfg.owoPrefix}\``);
                }

                if (subCmd === 'hunt') { serverCfg.huntMsg = newMsg; return message.channel.send(`✅ Updated **hunt** msg.`); }
                if (subCmd === 'godh' || subCmd === 'god') { serverCfg.godMsg = newMsg; return message.channel.send(`✅ Updated **god hunt** msg.`); }
                if (subCmd === 'owo') { serverCfg.owoMsg = newMsg; return message.channel.send(`✅ Updated **owo** msg.`); }
                if (subCmd === 'pray') { serverCfg.prayMsg = newMsg; return message.channel.send(`✅ Updated **pray** msg.`); }
                if (subCmd === 'vote') { serverCfg.voteMsg = newMsg; return message.channel.send(`✅ Updated **vote** msg.`); }
            }

            if (['owoh', 'godh', 'owo', 'owopray', 'owovote'].includes(command)) {
                return message.channel.send({ embeds: [createSettingsEmbed(message.author, command)], components: createSettingsButtons(message.author, command) });
            }

            if (command === 'gif') {
                const kategori = args[0]?.toLowerCase();
                const linkGif = args[1];
                if (!kategori || !linkGif) return message.channel.send(`❌ Format: \`${usedPrefix} gif godh <link_gif>\``);
                if (kategori === 'owo') userCfg.owoGif = linkGif;
                else if (kategori === 'hunt' || kategori === 'owoh') userCfg.huntGif = linkGif;
                else if (kategori === 'godh' || kategori === 'god' || kategori === 'gh') userCfg.godGif = linkGif;
                else if (kategori === 'pray' || kategori === 'owopray') userCfg.prayGif = linkGif;
                else if (kategori === 'vote' || kategori === 'owovote') userCfg.voteGif = linkGif;
                return message.channel.send(`✅ GIF **${kategori}** diperbarui!`);
            }

            // --- ⚔️ DUNGEON RAID & RANDOM COMPANION ENCOUNTER ---
            if (command === 'dungeon' || command === 'dg') {
                const player = getRpgPlayer(userId, message.author.username);
                
                const partyAtkBonus = player.party.reduce((acc, m) => acc + m.atkBonus, 0);
                const partyDefBonus = player.party.reduce((acc, m) => acc + m.defBonus, 0);

                const enemyHp = 60 + (player.floor * 20);
                const enemyAtk = 10 + (player.floor * 5);
                
                const embed = new EmbedBuilder()
                    .setColor(getRandomColor())
                    .setTitle(`🗺️ Dungeon Raid - Floor ${player.floor}`)
                    .setDescription(`👥 **Party Size:** \`${player.party.length}/3 Member\`\n⚠️ **Musuh Muncul!**\n❤️ Monster HP: \`${enemyHp}\`\n⚔️ Monster ATK: \`${enemyAtk}\`\n\n*Tim sedang bertarung...*`);
                
                const sentMsg = await message.channel.send({ embeds: [embed] });

                setTimeout(async () => {
                    let weaponStat = player.equipped.weapon?.stat || 0;
                    let armorStat = player.equipped.armor?.stat || 0;
                    let helmetStat = player.equipped.helmet?.stat || 0;

                    let totalAtk = player.atk + weaponStat + partyAtkBonus;
                    let totalDef = player.def + armorStat + helmetStat + partyDefBonus;

                    const playerPower = totalAtk * 3 + totalDef;
                    const enemyPower = enemyHp + (enemyAtk * 2);

                    if (playerPower >= enemyPower || Math.random() > 0.25) {
                        const roll = Math.random() * 100;
                        let rarity = 'Common';
                        let badge = '[C]';
                        let color = '#95a5a6';

                        if (roll <= 2) { rarity = 'Legendary'; badge = '[L]'; color = '#f1c40f'; } 
                        else if (roll <= 8) { rarity = 'Epic'; badge = '[E]'; color = '#9b59b6'; } 
                        else if (roll <= 20) { rarity = 'Rare'; badge = '[R]'; color = '#3498db'; } 
                        else if (roll <= 45) { rarity = 'Uncommon'; badge = '[U]'; color = '#2ecc71'; }

                        let minMult = 1, maxMult = 1.5;
                        if (rarity === 'Uncommon') { minMult = 1.6; maxMult = 2.5; }
                        else if (rarity === 'Rare') { minMult = 2.6; maxMult = 4.0; }
                        else if (rarity === 'Epic') { minMult = 4.1; maxMult = 6.5; }
                        else if (rarity === 'Legendary') { minMult = 6.6; maxMult = 10.0; }

                        const randomMult = minMult + Math.random() * (maxMult - minMult);

                        const itemTypes = [
                            { type: 'Weapon', name: 'Sword', emoji: '🗡️', base: player.floor * 4 },
                            { type: 'Weapon', name: 'Bow', emoji: '🏹', base: player.floor * 4 },
                            { type: 'Weapon', name: 'Staff', emoji: '🪄', base: player.floor * 4 },
                            { type: 'Weapon', name: 'Dagger', emoji: '🗡️', base: player.floor * 4 },
                            { type: 'Armor', name: 'Chestplate', emoji: '🛡️', base: player.floor * 3 },
                            { type: 'Helmet', name: 'Helm', emoji: '⛑️', base: player.floor * 3 }
                        ];
                        const selectedItemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
                        
                        const itemStat = Math.floor(selectedItemType.base * randomMult);
                        const newItem = {
                            id: Date.now(),
                            name: `${badge} ${rarity} ${selectedItemType.name}`,
                            type: selectedItemType.type,
                            emoji: selectedItemType.emoji,
                            rarity: rarity,
                            badge: badge,
                            stat: itemStat
                        };
                        player.inventory.push(newItem);

                        let companionText = "";
                        if (Math.random() <= 0.35) {
                            const compNames = ['Aria the Rogue', 'Gideon the Knight', 'Lyra the Mage', 'Kaelen the Archer', 'Vespera the Priest', 'Thorin the Berserker'];
                            const randomName = compNames[Math.floor(Math.random() * compNames.length)];
                            
                            const compRoll = Math.random() * 100;
                            let cRarity = 'Common', cBadge = '[C]';
                            if (compRoll <= 3) { cRarity = 'Legendary'; cBadge = '[L]'; }
                            else if (compRoll <= 10) { cRarity = 'Epic'; cBadge = '[E]'; }
                            else if (compRoll <= 25) { cRarity = 'Rare'; cBadge = '[R]'; }
                            else if (compRoll <= 50) { cRarity = 'Uncommon'; cBadge = '[U]'; }

                            let statBonusMultiplier = cRarity === 'Legendary' ? 15 : cRarity === 'Epic' ? 10 : cRarity === 'Rare' ? 6 : cRarity === 'Uncommon' ? 3 : 1;
                            const newCompanion = {
                                name: randomName,
                                class: cRarity + ' Adventurer',
                                tier: cRarity,
                                tierBadge: cBadge,
                                atkBonus: player.floor * statBonusMultiplier,
                                defBonus: Math.floor(player.floor * statBonusMultiplier * 0.5)
                            };

                            player.roster.push(newCompanion);
                            companionText = `\n👤 **Companion Baru Ditemukan!**\n✨ **${cBadge} ${randomName}** (${cRarity}) masuk ke \`!zoo\`!`;
                        }

                        player.floor += 1;

                        const winEmbed = new EmbedBuilder()
                            .setColor(color)
                            .setTitle(`🎉 Victory! (Floor ${player.floor - 1} Clear)`)
                            .setDescription(
                                `Tim berhasil mengalahkan monster! ⚔️\n\n` +
                                `🎁 **Item Drop Didapat:**\n` +
                                `${badge} **[${rarity}] ${selectedItemType.emoji} ${selectedItemType.name}** (+${itemStat} ${selectedItemType.type === 'Weapon' ? 'ATK' : 'DEF'})` +
                                `${companionText}\n\n` +
                                `✨ Naik ke **Floor ${player.floor}**! Ketik \`${usedPrefix} dungeon\` lagi untuk lanjut.`
                            );
                        await sentMsg.edit({ embeds: [winEmbed] });

                    } else {
                        const loseEmbed = new EmbedBuilder()
                            .setColor('#e74c3c')
                            .setTitle(`💀 Defeat!`)
                            .setDescription(`Tim kamu terlalu lemah di Floor ${player.floor}! Perkuat party atau equip gear yang lebih bagus.`);
                        await sentMsg.edit({ embeds: [loseEmbed] });
                    }
                }, 2000);
                return;
            }

            // --- 🎒 INVENTORY DISPLAY ---
            if (command === 'inv' || command === 'inventory') {
                const player = getRpgPlayer(userId, message.author.username);
                
                let wStat = player.equipped.weapon?.stat || 0;
                let aStat = player.equipped.armor?.stat || 0;
                let hStat = player.equipped.helmet?.stat || 0;
                let partyAtk = player.party.reduce((acc, m) => acc + m.atkBonus, 0);
                let partyDef = player.party.reduce((acc, m) => acc + m.defBonus, 0);

                let totalHp = player.maxHp + (hStat * 2);
                let totalAtk = player.atk + wStat + partyAtk;
                let totalDef = player.def + aStat + hStat + partyDef;

                let invList = player.inventory.length === 0 ? 'Inventory kosong! Main dungeon dulu (`!dungeon`).' : player.inventory.map((item, idx) => `\`[${idx + 1}]\` ${item.badge || ''} ${item.emoji} **${item.name}** (+${item.stat})`).join('\n');
                
                const embed = new EmbedBuilder()
                    .setColor(getRandomColor())
                    .setTitle(`🎒 ${message.author.username}'s Inventory & Stats`)
                    .setDescription(
                        `❤️ **Total HP:** \`${totalHp}\`\n` +
                        `⚔️ **Total ATK:** \`${totalAtk}\` (Base: ${player.atk} | Gear: +${wStat} | Party: +${partyAtk})\n` +
                        `🛡️ **Total DEF:** \`${totalDef}\` (Base: ${player.def} | Gear: +${aStat + hStat} | Party: +${partyDef})\n` +
                        `🗺️ **Current Floor:** \`Floor ${player.floor}\` | 👥 **Party:** \`${player.party.length}/3\`\n\n` +
                        `🛡️ **Equipped Gear:**\n` +
                        `• Weapon: ${player.equipped.weapon ? `${player.equipped.weapon.badge || ''} ${player.equipped.weapon.emoji} ${player.equipped.weapon.name} (+${player.equipped.weapon.stat})` : 'None'}\n` +
                        `• Armor: ${player.equipped.armor ? `${player.equipped.armor.badge || ''} ${player.equipped.armor.emoji} ${player.equipped.armor.name} (+${player.equipped.armor.stat})` : 'None'}\n` +
                        `• Helmet: ${player.equipped.helmet ? `${player.equipped.helmet.badge || ''} ${player.equipped.helmet.emoji} ${player.equipped.helmet.name} (+${player.equipped.helmet.stat})` : 'None'}\n\n` +
                        `📦 **Items List ([L] Legendary, [E] Epic, [R] Rare, [U] Uncommon, [C] Common):**\n${invList}\n\n` +
                        `*Gunakan \`${usedPrefix} equip <nomor>\` atau \`${usedPrefix} use <nomor>\` untuk memakai item.*`
                    );
                return message.channel.send({ embeds: [embed] });
            }

            if (command === 'equip' || command === 'use') {
                const player = getRpgPlayer(userId, message.author.username);
                const index = parseInt(args[0]) - 1;

                if (isNaN(index) || !player.inventory[index]) {
                    return message.channel.send(`❌ Masukkan nomor item yang valid! Contoh: \`${usedPrefix} equip 1\` atau \`${usedPrefix} use 1\``);
                }

                const item = player.inventory[index];
                if (item.type === 'Weapon') player.equipped.weapon = item;
                else if (item.type === 'Armor') player.equipped.armor = item;
                else if (item.type === 'Helmet') player.equipped.helmet = item;

                return message.channel.send(`✅ Berhasil memakai **${item.name}**! Status total karaktermu meningkat.`);
            }

            // --- 🐾 COMPANION ZOO ---
            if (command === 'zoo' || command === 'roster') {
                const player = getRpgPlayer(userId, message.author.username);
                
                let zooList = player.roster.map((comp, idx) => `\`[${idx + 1}]\` **${comp.tierBadge} ${comp.name}** (${comp.tier}) -> +${comp.atkBonus} ATK, +${comp.defBonus} DEF`).join('\n');
                
                const embed = new EmbedBuilder()
                    .setColor(getRandomColor())
                    .setTitle(`🦁 ${message.author.username}'s Companion Zoo / Roster`)
                    .setDescription(
                        `Daftar petualang / orang yang berhasil kamu temui dan kumpulkan dari dalam dungeon:\n\n${zooList}\n\n` +
                        `*Gunakan \`${usedPrefix} party add <nomor_zoo>\` untuk memasukkan mereka ke tim aktifmu!*`
                    );
                return message.channel.send({ embeds: [embed] });
            }

            // --- 👥 PARTY SYSTEM MANAGEMENT ---
            if (command === 'party') {
                const player = getRpgPlayer(userId, message.author.username);
                const subCmd = args[0]?.toLowerCase();

                if (subCmd === 'add') {
                    if (player.party.length >= 3) {
                        return message.channel.send(`❌ Party sudah penuh! Maksimal 3 anggota.`);
                    }
                    const zooIndex = parseInt(args[1]) - 1;
                    if (isNaN(zooIndex) || !player.roster[zooIndex]) {
                        return message.channel.send(`❌ Masukkan nomor companion dari \`${usedPrefix} zoo\` yang valid! Contoh: \`${usedPrefix} party add 2\``);
                    }

                    const selectedComp = player.roster[zooIndex];
                    if (player.party.includes(selectedComp)) {
                        return message.channel.send(`❌ Companion tersebut sudah ada di dalam party aktif!`);
                    }

                    player.party.push(selectedComp);
                    return message.channel.send(`✅ Berhasil memasukkan **${selectedComp.name} (${selectedComp.tierBadge})** ke dalam party!`);
                }

                if (subCmd === 'kick' || subCmd === 'remove') {
                    const memberIdx = parseInt(args[1]) - 1;
                    if (isNaN(memberIdx) || memberIdx === 0 || !player.party[memberIdx]) {
                        return message.channel.send(`❌ Masukkan nomor member party yang valid untuk dikeluarkan (Leader utama di nomor 1 tidak bisa dikeluarkan)!`);
                    }
                    const removed = player.party.splice(memberIdx, 1);
                    return message.channel.send(`🗑️ Berhasil mengeluarkan **${removed[0].name}** dari party.`);
                }

                let partyList = player.party.map((m, idx) => `\`[${idx + 1}]\` ${m.tierBadge || '[C]'} **${m.name}** (${m.tier || 'Leader'}) -> +${m.atkBonus} ATK, +${m.defBonus} DEF`).join('\n');
                const embed = new EmbedBuilder()
                    .setColor(getRandomColor())
                    .setTitle(`👥 ${message.author.username}'s Active Party (${player.party.length}/3)`)
                    .setDescription(
                        `Anggota tim yang membantumu bertarung di dungeon:\n\n${partyList}\n\n` +
                        `*Perintah Party:*\n` +
                        `• \`${usedPrefix} party add <nomor_zoo>\` : Masukkan dari \`${usedPrefix} zoo\`\n` +
                        `• \`${usedPrefix} party kick <nomor>\` : Keluarkan dari party`
                    );
                return message.channel.send({ embeds: [embed] });
            }

            // --- 🛠️ UTILITY COMMANDS HANDLER ---
            if (command === 'ping') {
                const sent = await message.channel.send("🏓 Measuring latency...");
                const latency = sent.createdTimestamp - message.createdTimestamp;
                const apiLatency = Math.round(client.ws.ping);
                return sent.edit(`🏓 **Pong!**\n📡 **Latency Bot:** \`${latency}ms\`\n⚡ **API Latency:** \`${apiLatency}ms\``);
            }

            if (command === 'clear') {
                if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                    return message.channel.send("❌ Kamu tidak memiliki izin `Manage Messages`!");
                }
                const amount = parseInt(args[0]);
                if (isNaN(amount) || amount < 1 || amount > 100) {
                    return message.channel.send("❌ Masukkan jumlah pesan dari 1 sampai 100! Contoh: `!pai clear 10`");
                }
                await message.channel.bulkDelete(amount, true).catch(() => {});
                const msg = await message.channel.send(`🧹 Berhasil menghapus **${amount}** pesan.`);
                setTimeout(() => msg.delete().catch(() => {}), 3000);
                return;
            }

            if (command === 'user') {
                const targetUser = message.mentions.users.first() || message.author;
                const member = await message.guild.members.fetch(targetUser.id).catch(() => null);
                
                const embed = new EmbedBuilder()
                    .setColor(getRandomColor())
                    .setAuthor({ name: `User Info - ${targetUser.username}`, iconURL: targetUser.displayAvatarURL() })
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 512 }))
                    .addFields(
                        { name: '👤 Username', value: `${targetUser.tag}`, inline: true },
                        { name: '🆔 User ID', value: `\`${targetUser.id}\``, inline: true },
                        { name: '📅 Akun Dibuat', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: false }
                    );

                if (member) {
                    embed.addFields({ name: '📥 Masuk Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true });
                }

                return message.channel.send({ embeds: [embed] });
            }

            if (command === 'uptime') {
                let totalSeconds = (client.uptime / 1000);
                let days = Math.floor(totalSeconds / 86400);
                totalSeconds %= 86400;
                let hours = Math.floor(totalSeconds / 3600);
                totalSeconds %= 3600;
                let minutes = Math.floor(totalSeconds / 60);
                let seconds = Math.floor(totalSeconds % 60);

                return message.channel.send(`⏰ **Bot Uptime:** \`${days}d ${hours}h ${minutes}m ${seconds}s\``);
            }

            if (command === 'server') {
                const guild = message.guild;
                const embed = new EmbedBuilder()
                    .setColor(getRandomColor())
                    .setTitle(`Server Info - ${guild.name}`)
                    .setThumbnail(guild.iconURL({ dynamic: true }))
                    .addFields(
                        { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
                        { name: '👥 Member Count', value: `\`${guild.memberCount}\` members`, inline: true },
                        { name: '📅 Server Dibuat', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: false }
                    );
                return message.channel.send({ embeds: [embed] });
            }

            if (command === 'avatar' || command === 'av') {
                const targetUser = message.mentions.users.first() || message.author;
                const avatarURL = targetUser.displayAvatarURL({ dynamic: true, size: 1024 });
                const embed = new EmbedBuilder()
                    .setColor(getRandomColor())
                    .setTitle(`Avatar - ${targetUser.username}`)
                    .setImage(avatarURL);
                return message.channel.send({ embeds: [embed] });
            }
        }

        // --- 🎯 AUTOMATIC REMINDERS ---
        const handleTimer = (type, timeMs, textMsg, modeKey, gifUrl) => {
            const timerKey = `${userId}_${type}_${message.channel.id}`;
            if (activeTimers.has(timerKey)) clearTimeout(activeTimers.get(timerKey));

            const timer = setTimeout(() => {
                const mentionStr = userCfg.pingsEnabled ? `<@${userId}>` : `**${message.author.username}**`;
                const payload = { content: `${mentionStr} ${textMsg}` };
                
                if (userCfg.replyEnabled) payload.reply = { messageReference: message.id };
                
                if (userCfg[modeKey] === 'gif') {
                    payload.embeds = [
                        new EmbedBuilder()
                            .setColor(getRandomColor())
                            .setImage(gifUrl)
                    ];
                }

                message.channel.send(payload).catch(() => {});
                activeTimers.delete(timerKey);
            }, timeMs);

            activeTimers.set(timerKey, timer);
        };

        // 1. OWO / UWU (15 Detik)
        if ((msgLower === 'owo' || msgLower === 'uwu') && userCfg.owoEnabled) {
            handleTimer('owo', 15000, serverCfg.owoMsg, 'owoMode', userCfg.owoGif);
            return;
        }

        // 2. HUNT BIASA (15 Detik)
        const isHunt = ['wh', 'owo hunt', 'owo h'].includes(msgLower) || msgLower.startsWith('wh ') || msgLower.startsWith('owo h ');
        if (isHunt && userCfg.huntEnabled) {
            handleTimer('hunt', 15000, serverCfg.huntMsg, 'huntMode', userCfg.huntGif);
            return;
        }

        // 3. GOD HUNT (15 Detik)
        const isGod = ['gh', 'owo gh'].includes(msgLower) || msgLower.startsWith('gh ') || msgLower.startsWith('owo gh ');
        if (isGod && userCfg.godEnabled) {
            handleTimer('god', 15000, serverCfg.godMsg, 'godMode', userCfg.godGif);
            return;
        }

        // 4. PRAY / CURSE (5 Menit)
        const isPray = msgLower.includes('wpray') || msgLower.includes('owo pray') || msgLower === 'wp' || msgLower === 'pr';
        if (isPray && userCfg.prayEnabled) {
            handleTimer('pray', 300000, serverCfg.prayMsg, 'prayMode', userCfg.prayGif);
            return;
        }

        // 5. 🗳️ VOTE REMINDER (12 Jam / 43200000 ms)
        const isVote = ['owo vote', 'w vote', 'vote'].includes(msgLower) || msgLower.startsWith('ov') || msgLower.startsWith('wv');
        if (isVote && userCfg.voteEnabled) {
            const voteTimeMs = 12 * 60 * 60 * 1000; // 12 Jam
            handleTimer('vote', voteTimeMs, serverCfg.voteMsg, 'voteMode', userCfg.voteGif);
            message.channel.send(`✅ <@${userId}> Pengingat vote 12 jam berhasil dipasang! 🗳️`).catch(() => {});
            return;
        }

    } catch (err) {
        console.error("Message error:", err);
    }
});

// --- 🔘 BUTTON INTERACTION HANDLER ---
client.on('interactionCreate', async (interaction) => {
    try {
        if (!interaction.isButton()) return;
        const parts = interaction.customId.split('_');
        const guildId = interaction.guild?.id || 'dm';
        const serverCfg = getServerConfig(guildId);

        if (interaction.customId === 'help_reminders') {
            return interaction.update({ embeds: [createHelpEmbed(interaction.guild?.name, interaction.user.displayAvatarURL(), serverCfg.botPrefix)], components: [createHelpButtons()] });
        }
        
        if (interaction.customId === 'help_utility') {
            const embed = new EmbedBuilder()
                .setColor(getRandomColor())
                .setTitle('🛠️ Commands Utilitas')
                .setDescription(
                    `\`${serverCfg.botPrefix} ping\` : Cek delay respon bot\n` +
                    `\`${serverCfg.botPrefix} clear <jumlah>\` : Hapus chat spam secara cepat\n` +
                    `\`${serverCfg.botPrefix} user [@user]\` : Tampilkan detail info user\n` +
                    `\`${serverCfg.botPrefix} uptime\` : Cek durasi bot menyala\n` +
                    `\`${serverCfg.botPrefix} server\` : Informasi server Discord\n` +
                    `\`${serverCfg.botPrefix} avatar [@user]\` : Ambil foto profil HD`
                );
            return interaction.update({ embeds: [embed], components: [createHelpButtons()] });
        }

        if (interaction.customId === 'help_settings') {
            return interaction.update({ embeds: [createServerSettingsEmbed(guildId)], components: [createHelpButtons()] });
        }

        if (parts[0] === 'toggle') {
            const [, key, type, ownerId] = parts;
            if (interaction.user.id !== ownerId) return interaction.reply({ content: '❌ Bukan settinganmu!', ephemeral: true });

            const config = getUserConfig(ownerId);
            const keyMap = { owoh: 'huntEnabled', godh: 'godEnabled', owo: 'owoEnabled', owopray: 'prayEnabled', owovote: 'voteEnabled' };
            const modeMap = { owoh: 'huntMode', godh: 'godMode', owo: 'owoMode', owopray: 'prayMode', owovote: 'voteMode' };

            if (key === 'enable') config[keyMap[type]] = !config[keyMap[type]];
            if (key === 'ping') config.pingsEnabled = !config.pingsEnabled;
            if (key === 'reply') config.replyEnabled = !config.replyEnabled;
            if (key === 'mode') config[modeMap[type]] = config[modeMap[type]] === 'text' ? 'gif' : 'text';

            return interaction.update({ embeds: [createSettingsEmbed(interaction.user, type)], components: createSettingsButtons(interaction.user, type) });
        }
    } catch (err) {
        console.error("Button error:", err);
    }
});

client.login(process.env.TOKEN);
