import { Manager, Socket } from "socket.io-client"

let socket: Socket;

export const connectToServer = (jwtToken: string) => {

    const manager = new Manager('http://localhost:3000/socket.io/socket.io.js', {
        extraHeaders: {
            authentication: jwtToken
        }
    });

    socket?.removeAllListeners();
    socket = manager.socket('/');

    addListeners();

}

const addListeners = () => {

    const serverStatusLabel = document.querySelector('#server-status');
    const clientsList = document.querySelector<HTMLUListElement>('#clients-ul');
    const messageForm = document.querySelector<HTMLFormElement>('#message-form');
    const messageInput = document.querySelector<HTMLInputElement>('#message-input');
    const messagesList = document.querySelector<HTMLUListElement>('#messages-ul');
    const inputJwt = document.querySelector<HTMLInputElement>('#jwt-token')!;


    if (serverStatusLabel && clientsList && messageInput && messagesList) {

        socket.on('connect', () => {
            serverStatusLabel.innerHTML = 'Online';
        })

        socket.on('disconnect', () => {
            serverStatusLabel.innerHTML = 'Offline';
            inputJwt.value = '';
        })

        socket.on('clients-updated', (clients: string[]) => {
            let clientsHtml = '';

            clients.forEach(clientId => {
                clientsHtml += `<li>${clientId}</li>`
            });

            clientsList.innerHTML = clientsHtml;
        })

        messageForm?.addEventListener('submit', (event) => {
            event.preventDefault();
            if (messageInput.value.trim().length <= 0) return;

            socket.emit('message-from-client', {
                id: 'Yo', message: messageInput?.value
            });

            messageInput.value = ''

        });

        socket.on('message-from-server', (payload: { fullname: string, message: string }) => {
            const newMessage = `
                <li>
                    <strong>${payload.fullname}</strong>
                    <span>${payload.message}</span>
                </li>`

            const li = document.createElement('li');
            li.innerHTML = newMessage;
            messagesList.append(li);

        })
    }


}