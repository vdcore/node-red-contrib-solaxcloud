// Node Red Node //
module.exports = function(RED) {
    function SolaxCloud(config) {
        RED.nodes.createNode(this,config);
        var context = this.context();
        var node = this;
        node.on('input', async function(msg) {
		try {
			let res_body = await getPromise("/login/login?password=" + this.credentials.password + "&userName=" + this.credentials.username + "&userType5");
			//msg.body1 = res_body;
			let res_body2 = await getPromise("/mysite/mySite?userId=" + res_body.result.userId + "&tokenId=" + res_body.result.tokenId);
			//msg.body2 = res_body2;
			let res_out = await getPromise("/mysite/getInverterInfo?siteId=" + res_body2.result[0].siteIds + "&tokenId=" + res_body.result.tokenId);
			msg.payload = res_out.result[0];
			msg.topic = "SolaxCloudRequest/" + res_body2.result[0].powerStationName;
			node.send(msg);
		}
		catch(error) {
			console.log("Error: " +error);
		}
        });
    }
    RED.nodes.registerType("SolaxCloud",SolaxCloud, {
        credentials: {
		username: {type:"text"},
            	password: {type:"password"}
        }
     });
};

// http abfrage bei SolaxCloud //
const http = require('http');
function getPromise(_path) {
        return new Promise((resolve, reject) => {
                const data = JSON.stringify({})
                const options = {
                        hostname: 'www.solaxcloud.com',
                        port: 6080,
                        path: "/proxy" + _path,
                        method: 'POST',
                        headers: {
                                'Content-Type': 'application/json',
                                'Content-Length': data.length
                        }
                }
                const req = http.request(options, (res) => {
                                res.on('data', (d) => {
                                        resolve(JSON.parse(d.toString('utf8')))
                                })
                            })
                req.write(data);
                req.end();
        });
}
