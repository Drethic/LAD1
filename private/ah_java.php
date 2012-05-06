<?php

if( $action == 'java_run' )
{
    $sock = preconnect_java();
    $req = $_REQUEST;
    $userid = $_SESSION[ 'ID' ];
    unset( $req[ 'action' ] );
    unset( $req[ '_'] );
    unset( $req[ 'end' ] );
    unset( $req[ 'userid' ] );
    foreach( $req as $key => $value )
    {
        $text = "$key,$value\n";
        fwrite( $sock, $text );
    }
    fwrite( $sock, "userid,$userid\n" );
    fwrite( $sock, "end,transmission\n" );
    fflush( $sock );

    echo postwrite_java( $sock );
}
else if( $action == 'java_shutdown' )
{
    $sock = preconnect_java();
    fwrite( $sock, "end,server\n" );
    fflush( $sock );
    echo postwrite_java( $sock );
}

?>