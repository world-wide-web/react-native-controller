#import <UIKit/UIKit.h>
#import "RCTBridge.h"

@interface RCCTabBarController : UITabBarController

- (instancetype)initWithProps:(NSDictionary *)props
                     children:(NSArray *)children
                       bridge:(RCTBridge *)bridge;

- (void)performAction:(NSString*)performAction
         actionParams:(NSDictionary*)actionParams
               bridge:(RCTBridge *)bridge
             resolver:(RCTPromiseResolveBlock)resolve
             rejecter:(RCTPromiseRejectBlock)reject;

@end