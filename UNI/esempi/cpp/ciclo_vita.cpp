// Costruttori e distruttori: in ogni blocco gli oggetti vengono distrutti
// in ordine inverso rispetto a quello di costruzione.
#include <iostream>
#include <string>
using namespace std;

//@region tutto
class Traccia {
    string nome;
public:
    Traccia(const string& n) : nome(n) {
        cout << "costruisco " << nome << '\n';   //@ctor
    }
    ~Traccia() {
        cout << "distruggo " << nome << '\n';    //@dtor
    }
};

void f() {
    Traccia c("C");                              //@f-c
    cout << "dentro f\n";                        //@f-print
}                                                //@f-end

int main() {
    Traccia a("A");                              //@m-a
    {                                            //@m-open
        Traccia b("B");                          //@m-b
        f();                                     //@m-f
    }                                            //@m-close
    Traccia d("D");                              //@m-d
    cout << "fine del main\n";                   //@m-print
    return 0;                                    //@m-ret
}                                                //@m-end
//@endregion
