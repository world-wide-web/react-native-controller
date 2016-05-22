#import <Foundation/Foundation.h>
#import "RCTBridgeModule.h"
#import <UIKit/UIKit.h>

@interface RCCManager : NSObject

+ (instancetype)sharedIntance;

-(void)initBridgeWithBundleURL:(NSURL *)bundleURL;

-(RCTBridge*)getBridge;

-(id)getControllerWithAddress:(NSNumber*)address;

@end
