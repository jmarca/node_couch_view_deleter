# node.js CouchDB view deleter

As the title would suggest, this is a simple utility program that will
delete everything in a given CouchDB view.

There is a command line interface, and a library so you can include it
in a program.

The use case is when you screw up and dump a load of docs into a
CouchDB and want to delete them.  In SQL, one can make a query and
then just delete those docs.  This program serves the same purpose.
You make a view that grabs the docs you no longer want, and then you
point this program at that view.

# testing

in order to test this, you need to create a file called
`test.config.json` that contains

``` json
{
    "couchdb": {
        "host": "127.0.0.1",
        "port":5984,
        "db": "a_test_database",
        "auth":{"username":"james",
                "password":"all cats eat grass"
               }
    }
}
```

Where the variables are adjusted to reflect your local CouchDB
install.

You also need to change the permissions on test.config.json to be
`0600`.  On linux you just type `chmod 0600 test.config.json`



# example usage

in order to test this, you need to create a file called
`config.json` that contains more or less the same thing as the
`test.config.json` above.  However, you need to use the live db
details, and also you need to define a view (the test uses a special
test view defined in the test)


``` json
{
    "couchdb": {
        "host": "127.0.0.1",
        "port":5984,
        "db": "the%2freal%2fdatabase",
        "auth":{"username":"james",
                "password":"all cats eat grass"
                },
        "view":"_design/erlangviews2/_view/ts_id_mismatch",
        "limit":1000,
        "looplimit":10
    }
}
```

Again, you have to change the permissions on `config.json` to be
`0600`.  On linux you just type `chmod 0600 test.config.json`


In this case, `erlangviews2` is the design document, with Erlang views
because they are faster than javascript views and I am not willing to
wait days right now, and `ts_id_mismatch` is the view with about
190,000 documents that are unworthy because my R script was buggy and
wrote them without the proper `_id` values.  The full view is defined
rather than by parts.  Note that the view has real slashes, while any
slashes in the database name need to be escaped by "%2f".

The run-time case also has a field called "limit" that is set
to 1000.  This is the default.  Watch your RAM, and push it up if you
have lots and lots of docs to delete, but 1000 is safe.  The way this
works the query pulls down the documents from couchdb, then rewrites
them with the delete flag set.  If you ask for a huge number of large
docs, you can crash your program.  If in doubt, set limit smaller and
see what happens.

Finally, because it is somewhat nerve wracking to delete items from a
database, there is a config parameter called "looplimit" that will
limit the total number of delete loops.  In the above example I've set
it to 10, which means I will delete at most 10,000 docs (1,000 docs,
10 times).  For testing I set looplimit to 1 and limit to 1 to make
sure that I'm not breaking anything.

To run it, you invoke:

```bash
node couch_view_deleter.js --config blabla.json
```

In the above case, the one and only command line option `--config` is
used to change from the default config file of `config.json` to
`blabla.json`.

Obviously, you can screw up pretty badly if you use the wrong
database, design document, or view.  But that is always true when
you're playing with databases and deleting docs.

# options

  --config   A config file other than config.json


# libraries

I split out the view deleter and the actual bulk doc deletion code
into separate files under lib.  The may be useful in future projects.
