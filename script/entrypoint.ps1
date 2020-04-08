param(
[string]$REMOTE='',
[string]$PORT=8000,
[string]$WAIT=5
)
  

While (![string]::IsNullOrEmpty($REMOTE)){
	 if((Test-NetConnection -ComputerName  $REMOTE -Port $PORT -InformationLevel Quiet)  -eq "error"){
		break;
	 }else{
        Write-output "Test Connection to $REMOTE failed, waiting for $WAIT seconds"
        Start-Sleep -Seconds $WAIT;
	 }
 }
Start-Sleep -Seconds $WAIT;
Invoke-Expression "nginx -g 'daemon off;'"
#Invoke-Expression "resty --nginx ./" 