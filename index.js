const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

const GOD_BOT_ID = "1521044059643318443"; 

let defaultTrigger = "!pai";
let customPrefix = "";

// 📦 Settings Per User
const userSettings = new Map();

function getUserConfig(userId) {
    if (!userSettings.has(userId)) {
        userSettings.set(userId, {
            huntEnabled: true,
            prayEnabled: true,
            owoEnabled: true,
            pingsEnabled: true,
            replyEnabled: true,
            mode: 'text', // 'text' atau 'gif'
            customHuntMsg: "hunt/battle 🎉",
            customOwoMsg: "owo 🥳",
            customGodMsg: "god ⚡",
            customPrayMsg: "pray/curse 🙏",
            huntGif: "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif",
            prayGif: "https://cdn.discordapp.com/attachments/1511280356802957414/1540470284237410314/b8c64c28f86119317d2aa2ce417e4579.gif"
        });
    }
    return userSettings.get(userId);
}

// Map timer aktif agar tidak duplikat
const activeTimers = new Map();

client.on('ready', () => {
    console.log(`✅ Bot ${client.user.tag} aktif & siap memantau!`);
});

// --- 🎨 EMBED & BUTTON SETTINGS GENERATOR ---
function createSettingsEmbed(user, type) {
    const config = getUserConfig(user.id);
    let isEnabled = false;
    let title = "";

    if (type === 'owoh') {
        isEnabled = config.huntEnabled;
        title = `${user.username}'s hunt/battle reminder settings`;
    } else if (type === 'owo') {
        isEnabled = config.owoEnabled;
        title = `${user.username}'s owo/uwu reminder settings`;
    } else if (type === 'owopray') {
        isEnabled = config.prayEnabled;
        title = `${user.username}'s pray/curse reminder settings`;
    }

    return new EmbedBuilder()
        .setColor(isEnabled ? '#43B581' : '#F04747')
        .setAuthor({ name: title, iconURL: user.displayAvatarURL() })
        .setDescription(
            `${isEnabled ? '✅' : '❌'} **Is this reminder enabled?**\n\n` +
            `${config.pingsEnabled ? '✅' : '❌'} **Pings / mentions enabled?**\n` +
            `${config.replyEnabled ? '✅' : '❌'} **Use inline replies?**\n` +
            `💬 **Current Mode:** \`${config.mode.toUpperCase()}\`\n\n` +
            `Gunakan \`!pai msg\` untuk mengganti teks/emoji.`
        );
}

function createSettingsButtons(user, type) {
    const config = getUserConfig(user.id);
    let isEnabled = false;

    if (type === 'owoh') isEnabled = config.huntEnabled;
    if (type === 'owo') isEnabled = config.owoEnabled;
    if (type === 'owopray') isEnabled = config.prayEnabled;

    return [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`toggle_enable_${type}_${user.id}`)
                .setLabel(type === 'owoh' ? 'hunt/battle' : type)
                .setEmoji('⚔️')
                .setStyle(isEnabled ? ButtonStyle.Success : ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(`toggle_ping_${type}_${user.id}`)
                .setLabel('ping')
                .setEmoji('🔴')
                .setStyle(config.pingsEnabled ? ButtonStyle.Success : ButtonStyle.Secondary)
        ),
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`toggle_reply_${type}_${user.id}`)
                .setLabel('reply')
                .setEmoji('↩️')
                .setStyle(config.replyEnabled ? ButtonStyle.Success : ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`toggle_mode_${type}_${user.id}`)
                .setLabel(`mode: ${config.mode}`)
                .setEmoji('🖼️')
                .setStyle(ButtonStyle.Primary)
        )
    ];
}

// --- 📩 MESSAGE EVENT ---
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const content = message.content.trim();
    const msgLower = content.toLowerCase();
    const userId = message.author.id;
    const config = getUserConfig(userId);

    let usedPrefix = null;
    if (msgLower.startsWith(defaultTrigger.toLowerCase())) {
        usedPrefix = defaultTrigger;
    } else if (customPrefix && msgLower.startsWith(customPrefix.toLowerCase())) {
        usedPrefix = customPrefix;
    }

    // --- 🛠️ COMMAND HANDLER (!pai ...) ---
    if (usedPrefix) {
        const args = content.slice(usedPrefix.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();

        if (command === 'owoh' || command === 'owo' || command === 'owopray') {
            const embed = createSettingsEmbed(message.author, command);
            const components = createSettingsButtons(message.author, command);
            return message.channel.send({ embeds: [embed], components });
        }

        if (command === 'msg') {
            const tipe = args.shift()?.toLowerCase();
            const newMsg = args.join(" ");

            if (!tipe || !newMsg) {
                return message.channel.send(`❌ Format salah! Contoh: \`!pai msg owo owo <emoji>\``);
            }

            if (tipe === 'owo') config.customOwoMsg = newMsg;
            else if (tipe === 'god') config.customGodMsg = newMsg;
            else if (tipe === 'hunt' || tipe === 'owoh') config.customHuntMsg = newMsg;
            else if (tipe === 'pray' || tipe === 'owopray') config.customPrayMsg = newMsg;

            return message.channel.send(`✅ Pesan pengingat **${tipe}** diubah menjadi: \`${newMsg}\``);
        }

        if (command === 'gif') {
            const kategori = args[0]?.toLowerCase();
            const linkGif = args[1];
            if (!kategori || !linkGif || (!linkGif.startsWith('http://') && !linkGif.startsWith('https://'))) {
                return message.channel.send(`❌ Format salah! Contoh: \`!pai gif hunt <link_gif>\``);
            }
            if (kategori === 'hunt' || kategori === 'owoh') config.huntGif = linkGif;
            else if (kategori === 'pray' || kategori === 'owopray') config.prayGif = linkGif;

            return message.channel.send(`✅ GIF **${kategori}** berhasil diperbarui!`);
        }
    }

    // --- 🎯 REMINDER MASING-MASING (SEPARATE & ACCURATE) ---

    // 1. Khusus OWO / UWU saja (15 Detik)
    if ((msgLower === 'owo' || msgLower === 'uwu') && config.owoEnabled) {
        const timerKey = `${userId}_owo_${message.channel.id}`;
        if (activeTimers.has(timerKey)) clearTimeout(activeTimers.get(timerKey));

        const timer = setTimeout(() => {
            const mentionStr = config.pingsEnabled ? `<@${userId}>` : `**${message.author.username}**`;
            const payload = { content: `${mentionStr} ${config.customOwoMsg}` };
            if (config.replyEnabled) payload.reply = { messageReference: message.id };
            if (config.mode === 'gif') payload.embeds = [new EmbedBuilder().setColor('#2B2D31').setImage(config.huntGif)];

            message.channel.send(payload).catch(() => {});
            activeTimers.delete(timerKey);
        }, 15000);

        activeTimers.set(timerKey, timer);
        return;
    }

    // 2. Khusus GOD saja (15 Detik)
    if (msgLower === 'god' && config.owoEnabled) {
        const timerKey = `${userId}_god_${message.channel.id}`;
        if (activeTimers.has(timerKey)) clearTimeout(activeTimers.get(timerKey));

        const timer = setTimeout(() => {
            const mentionStr = config.pingsEnabled ? `<@${userId}>` : `**${message.author.username}**`;
            const payload = { content: `${mentionStr} ${config.customGodMsg}` };
            if (config.replyEnabled) payload.reply = { messageReference: message.id };
            if (config.mode === 'gif') payload.embeds = [new EmbedBuilder().setColor('#2B2D31').setImage(config.huntGif)];

            message.channel.send(payload).catch(() => {});
            activeTimers.delete(timerKey);
        }, 15000);

        activeTimers.set(timerKey, timer);
        return;
    }

    // 3. Khusus HUNT / BATTLE saja (15 Detik)
    if ((msgLower === 'wh' || msgLower === 'owo hunt' || msgLower.startsWith('wh ') || msgLower.startsWith('owo h ')) && config.huntEnabled) {
        const timerKey = `${userId}_hunt_${message.channel.id}`;
        if (activeTimers.has(timerKey)) clearTimeout(activeTimers.get(timerKey));

        const timer = setTimeout(() => {
            const mentionStr = config.pingsEnabled ? `<@${userId}>` : `**${message.author.username}**`;
            const payload = { content: `${mentionStr} ${config.customHuntMsg}` };
            if (config.replyEnabled) payload.reply = { messageReference: message.id };
            if (config.mode === 'gif') payload.embeds = [new EmbedBuilder().setColor('#2B2D31').setImage(config.huntGif)];

            message.channel.send(payload).catch(() => {});
            activeTimers.delete(timerKey);
        }, 15000);

        activeTimers.set(timerKey, timer);
        return;
    }

    // 4. Khusus PRAY / CURSE saja (5 Menit / 300000 ms)
    if ((msgLower.includes('wpray') || msgLower.includes('owo pray') || msgLower === 'wp' || msgLower === 'pr') && config.prayEnabled) {
        const timerKey = `${userId}_pray_${message.channel.id}`;
        if (activeTimers.has(timerKey)) clearTimeout(activeTimers.get(timerKey));

        const timer = setTimeout(() => {
            const mentionStr = config.pingsEnabled ? `<@${userId}>` : `**${message.author.username}**`;
            const payload = { content: `${mentionStr} ${config.customPrayMsg}` };
            if (config.replyEnabled) payload.reply = { messageReference: message.id };
            if (config.mode === 'gif') payload.embeds = [new EmbedBuilder().setColor('#2B2D31').setImage(config.prayGif)];

            message.channel.send(payload).catch(() => {});
            activeTimers.delete(timerKey);
        }, 300000);

        activeTimers.set(timerKey, timer);
        return;
    }
});

// --- 🤖 REMINDER AUTOHUNT GOD BOT VIA DM ---
client.on('messageCreate', async (message) => {
    if (message.author.id === GOD_BOT_ID || message.author.username.includes('GoD')) {
        if (message.content.includes("captcha") || message.content.includes("verify")) {
            message.channel.send(`🚨 **PERINGATAN GOD:** Ada Captcha/Verifikasi! Cek sekarang!`);
        }

        if (message.content.includes('I WILL BE BACK IN')) {
            const hoursMatch = message.content.match(/(\d+)H/i);
            const minutesMatch = message.content.match(/(\d+)M/i);

            let totalMs = 0;
            if (hoursMatch) totalMs += parseInt(hoursMatch[1]) * 60 * 60 * 1000;
            if (minutesMatch) totalMs += parseInt(minutesMatch[1]) * 60 * 1000;

            const targetUser = message.mentions.users.first() 
                || (message.reference ? (await message.fetchReference().catch(() => null))?.author : null);

            if (totalMs > 0 && targetUser) {
                const hours = hoursMatch ? hoursMatch[1] : 0;
                const minutes = minutesMatch ? minutesMatch[1] : 0;

                message.channel.send(`⏰ **Pengingat Dipasang!** Aku bakal DM <@${targetUser.id}> dalam **${hours} jam ${minutes} menit** lagi.`);

                setTimeout(async () => {
                    try {
                        await targetUser.send(`🔔 **AUTOHUNT GOD SELESAI!** Waktunya ketik \`ghb 1d\` lagi di server!`);
                    } catch (error) {
                        message.channel.send(`🔔 <@${targetUser.id}> **AUTOHUNT GOD SELESAI!**`);
                    }
                }, totalMs);
            }
        }
    }
});

// --- 🔘 INTERACTION BUTTON HANDLER ---
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const [action, key, type, ownerId] = interaction.customId.split('_');

    if (action === 'toggle' && interaction.user.id === ownerId) {
        const config = getUserConfig(ownerId);

        if (key === 'enable') {
            if (type === 'owoh') config.huntEnabled = !config.huntEnabled;
            if (type === 'owo') config.owoEnabled = !config.owoEnabled;
            if (type === 'owopray') config.prayEnabled = !config.prayEnabled;
        } else if (key === 'ping') {
            config.pingsEnabled = !config.pingsEnabled;
        } else if (key === 'reply') {
            config.replyEnabled = !config.replyEnabled;
        } else if (key === 'mode') {
            config.mode = config.mode === 'text' ? 'gif' : 'text';
        }

        const embed = createSettingsEmbed(interaction.user, type);
        const components = createSettingsButtons(interaction.user, type);

        await interaction.update({ embeds: [embed], components });
    } else if (action === 'toggle' && interaction.user.id !== ownerId) {
        await interaction.reply({ content: '❌ Ini bukan panel setting milikmu!', ephemeral: true });
    }
});

client.login(process.env.TOKEN);
                          
