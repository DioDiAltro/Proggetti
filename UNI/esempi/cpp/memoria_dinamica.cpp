// Stack e heap: new e delete, new[] e delete[], puntatore pendente.
// Ogni new ha il suo delete: alla fine non resta memoria persa.
#include <iostream>
using namespace std;

//@region main
int main() {
    int x = 10;                         //@x
    int* p = &x;                        //@p
    *p = 20;                            //@deref
    int* q = nullptr;                   //@q
    q = new int(7);                     //@new
    *q += 1;                            //@q-inc
    int n = 4;                          //@n
    int* a = new int[n];                //@new-arr
    for (int i = 0; i < n; i++)         //@for
        a[i] = i * i;                   //@a-i
    cout << x << ' ' << *q << ' ' << a[3] << '\n';   //@print
    delete q;                           //@delete
    q = nullptr;                        //@q-null
    delete[] a;                         //@delete-arr
    a = nullptr;                        //@a-null
    return 0;                           //@ret
}
//@endregion
