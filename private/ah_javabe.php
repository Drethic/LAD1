<?php

if( $action == 'java_run' )
{
    $sock = @stream_socket_client( '127.0.0.1:19191', $errno, $errstr, 0.2,
            STREAM_CLIENT_CONNECT | STREAM_CLIENT_PERSISTENT );
    if( !$sock )
    {
        $title = 'Server Error';
        $msg = 'An internal server is down.  Please try again later.';
        $func = '$("#LAD.popup .close_popup").trigger(\'click\');';
        echo "genericErrorDialog(\"$title\",\"$msg\",function(){ $func });";
        exit( 0 );
    }
    $req = $_REQUEST;
    unset( $req[ 'action' ] );
    unset( $req[ '_'] );
    foreach( $req as $key => $value )
    {
        $text = "$key,$value\n";
        fwrite( $sock, $text );
    }
    fwrite( $sock, "end,transmission\n" );
    
    $done = false;
    $output = '';
    while( !$done )
    {
        $line = stream_get_line( $sock, 1024, "\n" );
        if( $line == 'DONE' || feof( $sock ) )
        {
            $done = true;
        }
        else
        {
            $output .= "$line\n";
        }
    }
    echo $output;
}

?>