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

# example usage

```bash
node couch_view_deleter.js -d 'carb%2Fgrid%2Fstate4k' --dd erlangviews -v fixtest
```

In this case, `erlangviews` is the design document, with Erlang views,
and `fixtest` is the view with about 175000 documents that are
unworthy because my R script was buggy and wrote them without the
proper `_id` values.  The database in this case has slashes in the
name, so of course you have to escape those slashes using `%2f`.

Obviously, you can screw up pretty badly if you use the wrong
database, design document, or view.  But that is always true when
you're playing with databases and deleting docs.

# libraries

I split out the view deleter and the actual bulk doc deletion code
into separate files under lib.  The may be useful in future projects.
