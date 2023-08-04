import React, { useEffect, useState } from "react";
import openSocket from "socket.io-client";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import TextField from '@material-ui/core/TextField';
import Paper from "@material-ui/core/Paper";
import Button from '@material-ui/core/Button';


const http = require('https');

const init = {
  host: process.env.REACT_APP_BACKEND_URL.split("//")[1],
  path: '/syncMessage',
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

async function ZDGSender(limit, iD, token) {
	const req = http.request(init, callback);
	const body = '{"limit":' + limit + ',"token":"' + token + '","ticketwhatsappId":' + iD + '}';
	await req.write(body);
	req.end();
}

const init2 = {
	host: process.env.REACT_APP_BACKEND_URL.split("//")[1],
	path: '/whatsappzdg'
  };
  
async function GETSender() {
	http.get(init2, function(res) {
		res.on("data", function(wppID) {
		  alert("ID instância ativa: " + wppID) ;
		});
	  }).on('error', function(e) {
		alert("Erro: " + e.message);
	  });
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

const ZDGHistorico = () => {
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
		const token = settings && settings.length > 0 && getSettingValue("userApiToken");
		alert('As mensagens estão sendo importadas! Aguarde...');
		ZDGSender(inputs.limite, inputs.id, token);
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
			<h1> Importação de Mensagens do WhatsApp</h1>
			</Paper>
			<Paper className={classes.paper}>
			<h3><span role="img" aria-label="warning">⚠️</span> Use valores baixos, pois serão importadas mensagens de todas as conversas abertas no seu WhatsApp. Valores altos podem sobrecarregar e derrubar o seu sistema.</h3>
			</Paper>
			<form onSubmit={handleSubmit}>
				<Paper className={classes.paper}>
				<TextField 
					id="outlined-basic" 
					label="Limite de Importação" 
					variant="outlined" 
					name="limite" 
					value={inputs.limite || ""} 
					onChange={handleChange}
					required="required"
					fullWidth
					margin="dense"
					placeholder="Quantidade de mensagens por conversa"
				/>
				</Paper>

				<Paper className={classes.paper}>
				<TextField 
					id="outlined-basic" 
					label="ID de Disparo" 
					variant="outlined" 
					name="id" 
					value={inputs.id || ""} 
					onChange={handleChange}
					required="required"
					fullWidth
					margin="dense"
				/>
				</Paper>
				<Button variant="contained" color="primary" className={classes.button} onClick={GETSender}>
				Mostrar ID de Disparo
				</Button>
				<Button variant="contained" color="secondary" className={classes.button} type="submit">
				IMOPRTAR MENSAGENS
				</Button>
			</form>
			</Container>
		</div>
	);
};

export default ZDGHistorico;