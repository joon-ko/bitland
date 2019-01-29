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