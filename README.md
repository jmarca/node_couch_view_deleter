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

# options

  -d, --db   [required]    The database to query

  -v, --view [required] The view to use.  Every doc that is pulled
                        into the view will be deleted

  --dd, --designdoc [required] The design doc that contains the view,
                               above.

  -l, --limit [default: 1000] How many docs at a time to process

  -h, --help  display this hopefully helpful message

The -l option is set to 1000 because that seemed reasonable.
Something small like 10 will take an age, while something too big runs
the risk of swamping your available memory.  Recall that you're
pulling a big JSON doc with each request that has to be parsed into
the component docs and then sent back again to the server with the
correct `_id` and `_rev` fields, so don't go too big.  I just set it
at 1000, and take a look at top, and then dial it up or down from
there.


# libraries

I split out the view deleter and the actual bulk doc deletion code
into separate files under lib.  The may be useful in future projects.
