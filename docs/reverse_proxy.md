# reverse proxy

openIMIS serves different service base on URI, the default are:
 
 - /api/: backend 
 - /front/: frontend 
 - /lightning/: lightning
 - /opensearch/: opensearch 
 - /restapi/: C# restAPI (discontinued) 


to allow user to easily change the revers proxy the conf/locations folder contains a file per service, 

changing the file extension or removing the file will remove the reverse proxy configuration

file update can be made, but one must be careful when using variable because at the container start, all ENV system variable will be substituted by their value (see entrypoints.sh to see how it is done)