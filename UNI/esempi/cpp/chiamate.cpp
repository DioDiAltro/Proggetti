// Lo stack delle chiamate: main chiama f, f chiama g.
// Ogni chiamata ha il suo frame con parametri e variabili locali.
#include <iostream>
using namespace std;

//@region tutto
int g(int x) {
    int y = x * x;                         //@g-y
    return y;                              //@g-ret
}

int f(int a) {
    int b = g(a + 1);                      //@f-call
    return b - a;                          //@f-ret
}

int main() {
    int r = f(3);                          //@m-call
    cout << "r = " << r << '\n';           //@m-print
    return 0;                              //@m-ret
}
//@endregion
