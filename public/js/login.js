function login() {
	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;
	axios.post('/auth/login', { username: username, password: password })
		.then((res) => {
			const redirect = res.data.redirect;
			if (redirect === '/') window.location = '/';
			else if (redirect === '/login') window.location = '/login';
		})
		.catch((err) => {
			console.log(err);
		})
}

// pressing enter is the same as login attempt
document.addEventListener('keydown', (e) => {
	switch (e.keyCode) {
		case 13: // enter
			login();
			break;
	}
});