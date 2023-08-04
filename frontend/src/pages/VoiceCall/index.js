import React, { useEffect, useState } from "react";
import openSocket from "socket.io-client";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import TextField from '@material-ui/core/TextField';
import Paper from "@material-ui/core/Paper";
import Button from '@material-ui/core/Button';

const http = require('http');

const init = {
  host: process.env.REACT_APP_BACKEND_URL.split("//")[1],
  path: '/makeVoiceCall',
  method: 'POST',
  headers: {
    'content-type': 'application/json; charset=utf-8'
  }
};

const callback = function(response) {
  let result = Buffer.alloc(0);
  response.on('data', function(chunk) {
    result = Buffer.concat([result, chunk]);
  });
  
  response.on('end', function() {
    console.log(result.toString());
  });
};

async function ZDGVoice(from, to, text, token) {
	const req = http.request(init, callback);
	const body = '{"from":"'+ from + '","to":"' + to + '","token":"' + token + '","text":"' + text + '"}';
	await req.write(body);
	req.end();
}

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		alignItems: "center",
		padding: theme.spacing(4),
		backgroundColor: theme.palette.background.default,
	},

	paper: {
		padding: theme.spacing(2),
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		textAlign: "center",
		verticalAlign: "middle",
		marginBottom: 12,
	},

	button: {
		padding: theme.spacing(2),
		display: "inline-flex",
		justifyContent: "center",
		alignItems: "center",
		textAlign: "center",
		verticalAlign: "middle",
		marginBottom: 12,
		marginRight: 12,
	},


	settingOption: {
		marginLeft: "auto",
	},
	margin: {
		margin: theme.spacing(1),
	},
}));

const VoiceCall = () => {
	const classes = useStyles();
	const [inputs, setInputs] = useState({});
	const [settings, setSettings] = useState([]);

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const { data } = await api.get("/settings");
				setSettings(data);
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, []);
	
	const getSettingValue = key => {
		const { value } = settings.find(s => s.key === key);
		return value;
	};


	const handleChange = (event) => {
		const name = event.target.name;
		const value = event.target.value;
		setInputs(values => ({...values, [name]: value}))
	  }
	
	const handleSubmit = (event) => {
		event.preventDefault();
		alert('As chamadas estão sendo carregadas! Aguarde...');
		const usersTextArea = inputs.user.split('\n');
		const token = settings && settings.length > 0 && getSettingValue("userApiToken");
		usersTextArea.forEach((user) => {
			setTimeout(function() {
				ZDGVoice(inputs.from, user, inputs.message, token);
				alert('Chamada realizada para o número: ' + user);
				},5000 + Math.floor(Math.random() * 10))            
		  });
	}
	
	useEffect(() => {
		const socket = openSocket(process.env.REACT_APP_BACKEND_URL);
		return () => {
			socket.disconnect();
		};
	}, []);

	return (
		<div className={classes.root}>  
			<Container className={classes.container} maxWidth="sm">
			<Paper className={classes.paper}>
			<h1> Realizar Chamadas de VOZ</h1>
			</Paper>
			<Paper className={classes.paper}>
			<h3><span role="img" aria-label="warning">⚠️</span> Ligação Tefefônica via VONAGE API.</h3>
			</Paper>
			<Paper className={classes.paper}>
			<h3><span role="img" aria-label="phone">📱</span> Essa funcionalidade depende da configuração e compra de créditos direto com a VONAGE API.</h3>
			</Paper>
			<form onSubmit={handleSubmit}>
				<Paper className={classes.paper}>
				<TextField 
					id="outlined-basic" 
					label="Números" 
					variant="outlined" 
					name="user" 
					value={inputs.user || ""} 
					onChange={handleChange}
					required="required"
					fullWidth
					multiline
					margin="dense"
					placeholder="553588754197&#13;&#10;553588754197&#13;&#10;553588754197&#13;&#10;553588754197"
				/>
				</Paper>
				<Paper className={classes.paper}>
				<TextField 
					id="outlined-basic" 
					label="Mensagem" 
					variant="outlined" 
					name="message" 
					value={inputs.message || ""} 
					onChange={handleChange}
					required="required"
					fullWidth
					multiline
					margin="dense"
					placeholder="Olá, tudo bem?&#13;&#10;Como posso te ajudar?&#13;&#10;Abraços, a gente se vê!"
				/>
				</Paper>
				<Paper className={classes.paper}>
				<TextField 
					id="outlined-basic" 
					label="Remetente" 
					variant="outlined" 
					name="from" 
					value={inputs.from || ""} 
					onChange={handleChange}
					required="required"
					fullWidth
					margin="dense"
					placeholder="Pedrinho da NASA"
				/>
				</Paper>
				<Button variant="contained" color="secondary" className={classes.button} type="submit">
				DISPARAR
				</Button>
			</form>
			</Container>
		</div>
	);
};

export default VoiceCall;