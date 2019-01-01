<!DOCTYPE html>
<html lang="en" dir="ltr">
<base href="/">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, minimum-scale=1,initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="description" content="Tube Timetable">
    <link rel="manifest" href="manifest.json">
    <link rel="shortcut icon" href="images/icons/favicon-32x32.png">
    <meta name="theme-color" content="#009900">
    <title>London Tube Timetables</title>
</head>
<body>
    <tube-app></tube-app>
</body> 
<script type='module'>
    import "/routes/tube-app/tube-app.js";
</script>
<script>
    if('serviceWorker' in navigator){
        navigator.serviceWorker.register('sw.js')
        .then(console.debug)
        .catch(console.log);

        navigator.serviceWorker.addEventListener('message',(event)=>{
            console.debug(event);
        });
    }
</script>
</html>
