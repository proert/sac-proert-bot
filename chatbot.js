const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client();

// Serviço de leitura do QR Code
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Quando o cliente estiver pronto
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

// Inicializa o cliente
client.initialize();

// Função para criar um delay
const delay = ms => new Promise(res => setTimeout(res, ms));

// Função para enviar mensagens com simulação de digitação
async function sendMessageWithTyping(chat, message) {
    await delay(3000); // Delay de 3 segundos
    await chat.sendStateTyping(); // Simulando digitação
    await delay(3000); // Delay de 3 segundos
    await chat.sendMessage(message); // Envia a mensagem
}

// Função para gerar um número de protocolo único
function generateProtocolNumber() {
    return Math.floor(100000 + Math.random() * 900000); // Gera um número de 6 dígitos
}

// Objeto para armazenar interações (simulado em memória)
const interactions = {};

// Função principal para lidar com as mensagens
client.on('message', async msg => {
    try {
        const chat = await msg.getChat();
        const userPhone = msg.from; // Número do usuário

        // Mensagem de boas-vindas (inclui "Bom dia", "Boa tarde", "Boa noite")
        if (msg.body.match(/(oi|olá|ola|Oi|Olá|Ola|menu|Menu|bom dia|boa tarde|boa noite|Bom dia|Boa tarde|Boa noite)/i) && msg.from.endsWith('@c.us')) {
            await sendMessageWithTyping(chat, 
                `Bem-vindo ao atendimento SAC Proert & Liderart! 🏢\n\n` +
                `Como podemos ajudar? Por favor, escolha uma das opções abaixo:\n\n` +
                `1 - Dúvidas sobre Benefícios\n` +
                `2 - Pagamentos\n` +
                `3 - Outros`
            );
        }

        // Opção 1 - Dúvidas sobre Benefícios
        else if (msg.body === '1' && msg.from.endsWith('@c.us')) {
            const protocolNumber = generateProtocolNumber(); // Gera o número de protocolo
            await sendMessageWithTyping(chat, 
                `Você selecionou *Dúvidas sobre Benefícios*. Aqui estão as informações principais:\n\n` +
                `📌 *Vale-Refeição*: Crédito mensal para uso em restaurantes credenciados.\n` +
                `📌 *Vale-Transporte*: Creditado mensalmente todo dia 01.\n\n` +
                `Obrigado! 🕒 Responderemos em até 48 horas.\n` +
                `Caso seja de *extrema urgência*, entre em contato com seu supervisor.\n\n` +
                `*Número de Protocolo:* ${protocolNumber}`
            );
        }

        // Opção 2 - Pagamentos
        else if (msg.body === '2' && msg.from.endsWith('@c.us')) {
            const protocolNumber = generateProtocolNumber(); // Gera o número de protocolo
            await sendMessageWithTyping(chat, 
                `Você selecionou *Pagamentos*. Aqui estão as informações principais:\n\n` +
                `📌 *Data de Pagamento*: Todo quinto dia útil do mês.\n` +
                `📌 *Holerite*: Disponível no portal do colaborador: https://app.epays.com.br/\n\n` +
                `Obrigado! 🕒 Responderemos em até 48 horas.\n` +
                `Caso seja de *extrema urgência*, entre em contato com seu supervisor.\n\n` +
                `*Número de Protocolo:* ${protocolNumber}`
            );
        }

        // Opção 3 - Outros
        else if (msg.body === '3' && msg.from.endsWith('@c.us')) {
            interactions[userPhone] = { step: 'awaitingDescription' }; // Marca que está aguardando a descrição
            await sendMessageWithTyping(chat, 
                `Você selecionou *Outros*. Por favor, descreva sua dúvida ou solicitação.`
            );
        }

        // Captura a descrição da dúvida/solicitação (após o usuário selecionar a opção 3)
        else if (interactions[userPhone] && interactions[userPhone].step === 'awaitingDescription') {
            const protocolNumber = generateProtocolNumber(); // Gera o número de protocolo
            await sendMessageWithTyping(chat, 
                `Obrigado! 🕒 Responderemos em até 48 horas.\n` +
                `Caso seja de *extrema urgência*, entre em contato com seu supervisor.\n\n` +
                `*Número de Protocolo:* ${protocolNumber}`
            );

            // Limpa a interação após conclusão
            delete interactions[userPhone];
        }

        // Ignorar outras mensagens que não sejam comandos válidos
        else if (!msg.from.endsWith('@c.us')) {
            return; // Ignora mensagens que não são de usuários válidos
        }
    } catch (error) {
        console.error('Erro ao processar mensagem:', error);
    }
});